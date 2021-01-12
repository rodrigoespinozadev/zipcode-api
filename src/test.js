const { handler } = require("./index");

describe("basic tests", () => {
  test("handler function exists", () => {
    expect(typeof handler).toBe("function");
  });

  test("route not found", async () => {
    response = await handler({
      'httpMethod': 'GET',
      'path': '/some_route'
    });

    expect(response.statusCode).toBe(404);
  });
  
  test("invalid request method", async () => {
    response = await handler({
      'httpMethod': 'DELETE',
      'path': '/resource'
    });

    expect(response.statusCode).toBe(405);
  });

  test("result is not null", async () => {
    response = await handler({
      'httpMethod': 'GET',
      'path': '/resource'
    });

    expect(response.body).not.toBeNull();
  });
  
  test("post request success", async () => {
    response = await handler({
      'httpMethod': 'POST',
      'path': '/resource',
      'headers': {
        'content-type': 'application/json'
      },
      'body': "{'title':'hello world'}"
    });

    expect(response.body).not.toBeNull();
  });

  test('throws error', async() => {
    await expect(handler({
        "httpMethod": "POST",
        "path": "/resource",
    })).rejects.toThrow();
  });
});
