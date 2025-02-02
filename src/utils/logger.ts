interface LogMessage {
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

export const logInfo = (message: LogMessage): void => {
  console.log(JSON.stringify(message));
};

export const logError = (message: LogMessage): void => {
  console.error(JSON.stringify(message));
};
