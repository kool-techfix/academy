/**
 * An error that carries the HTTP status a route should respond with.
 * Thrown by services so routes don't have to map messages to statuses.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
