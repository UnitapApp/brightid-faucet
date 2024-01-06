const validateEmail = (email: string) => {
  return !!email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const checkTwitterVAlidation = (username: string) => {
  return !!username.match(/^[A-Za-z0-9_]{1,15}$/);
};

const checkDiscordValidation = (username: string) => {
  const usernameRegex =
    /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/;
  return !!username.match(usernameRegex);
};

const checkTelegramValidation = (username: string) => {
  const usernameRegex = /^[a-zA-Z0-9_]{5,32}$/;
  return !!username.match(usernameRegex);
};

const checkUrlValidation = (urlString: string) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return !!urlPattern.test(urlString);
};

export const checkSocialMediaValidation = (
  creatorUrl: string | null,
  twitter: string | null,
  discord: string | null,
  email: string | null,
  telegram: string | null
) => {
  const emailValidation = email ? validateEmail(email) : true;
  const twitterValidation = twitter
    ? checkTwitterVAlidation(twitter.replace("@", ""))
    : true;
  const urlValidation = creatorUrl
    ? checkUrlValidation(creatorUrl)
    : true;
  const discordValidation = discord
    ? checkDiscordValidation(discord.replace("@", ""))
    : true;
  const telegramValidation = telegram
    ? checkTelegramValidation(telegram.replace("@", ""))
    : true;

  return {
    urlValidation,
    twitterValidation,
    discordValidation,
    emailValidation,
    telegramValidation,
  };
};
