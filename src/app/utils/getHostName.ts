export const getHostName = (host: string) => {
  const portPos = host.indexOf(':');

  if (portPos > -1) {
    return host.slice(0, portPos);
  }

  return host;
};
