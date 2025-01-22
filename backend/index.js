import axios from 'axios';

const guilds = await axios.get("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer fEiiq8K6PJBshIq64MlJMyFIfQQwE2` },
});
console.log(guilds.data);
