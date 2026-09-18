export class IntegrationNotConfiguredError extends Error {
  constructor(public readonly integration: string) {
    super(`${integration} is not configured.`);
    this.name = "IntegrationNotConfiguredError";
  }
}

export class NotAuthorizedError extends Error {
  constructor(message = "Not authorized.") {
    super(message);
    this.name = "NotAuthorizedError";
  }
}
