import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createStaticServer } from "../server.mjs";

let server, base;
before(async () => {
  server = createStaticServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("serves the app and its local assets with the expected content types", async () => {
  for (const [path, type] of [
    ["/", "text/html"],
    ["/app.js?v=4", "text/javascript"],
    ["/climate.js?v=4", "text/javascript"],
    ["/home.css", "text/css"],
    ["/assets/camera-bedroom.jpg", "image/jpeg"],
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.ok(response.headers.get("content-type").startsWith(type));
    const bytes = await response.arrayBuffer();
    assert.ok(bytes.byteLength > 0);
  }
});

test("HEAD returns the same length as GET, without a response body", async () => {
  const get = await fetch(base + "/");
  const head = await fetch(base + "/", { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(
    head.headers.get("content-length"),
    get.headers.get("content-length"),
  );
  assert.equal(await head.text(), "");
  await get.arrayBuffer();
});

test("does not expose project files, encoded traversal or a fictitious HA API", async () => {
  for (const path of [
    "/package.json",
    "/.env",
    "/%2e%2e%2fpackage.json",
    "/api/states",
    "/missing",
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
    await response.text();
  }
  const malformed = await fetch(base + "/%ZZ");
  assert.equal(malformed.status, 400);
});

test("rejects write requests rather than pretending to control an appliance", async () => {
  const response = await fetch(base + "/api/services/light/turn_on", {
    method: "POST",
  });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET, HEAD");
});

test("does not follow a public asset symlink outside the static directory", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "maison-plus-server-"));
  const root = join(temporary, "public");
  await mkdir(root);
  await writeFile(join(temporary, "private.txt"), "private");
  await symlink(join(temporary, "private.txt"), join(root, "linked.txt"));
  const isolated = createStaticServer({ root });
  isolated.listen(0, "127.0.0.1");
  await once(isolated, "listening");
  try {
    const response = await fetch(
      `http://127.0.0.1:${isolated.address().port}/linked.txt`,
    );
    assert.equal(response.status, 404);
  } finally {
    await new Promise((resolve) => isolated.close(resolve));
    await rm(temporary, { recursive: true });
  }
});
