# Discord Activity Starter

<p align="center">
  <img src="/assets/screenshot.png" alt="Discord Activity Screenshot" />
</p>

### What is this?

This is a starter template for building Discord activities. It comes with all you need to create 3D activities, physics and multipayer included ⚡️

> Activities are multiplayer games and social experiences in Discord. An Activity is a web application hosted in an iframe that can run within the Discord client on desktop, web, or mobile. The Embedded App SDK handles the communication between Discord and your iframed application.

[Learn more about Discord activities](https://discord.com/build/embedded-app-sdk)

<p align="center">
  <img src="/assets/createActivity.png" alt="Create a Discord Activity" />
</p>
Built-in multiplayer with Playroom.

## How it's built?

This starter is built with [SvelteKit](https://kit.svelte.dev/) and uses the [Three JS](https://threejs.org/) 3D library and the [Rapier](https://rapier.rs/) physics engine. The multiplayer is done using [Playroom](https://joinplayroom.com/).
Why SvelteKit? Because you ship _fast_ 👇

```svelte
    <script>
        let count = 0;

        function increment() {
            count += 1;
        }
    </script>

    <button on:click={increment}>
        Clicked {count}
        {count === 1 ? 'time' : 'times'}
    </button>
```

## How to run it locally?

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Npm](https://docs.npmjs.com/getting-started)
- A Cloudflare account and [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed

### Run the project

1.  Create a new Discord App from your [Developer Portal](https://discord.com/developers/applications) and click on `Getting started` under the `Activities` tab. Then, follow the instructions.

<p align="center">
  <img src="/assets/createActivity.png" alt="Create a Discord Activity" />
</p>

2. Create a new project on [Playroom](https://joinplayroom.com/), select `Discord Activity`, and follow the instructions.

<p align="center">
  <img src="/assets/playroom.png" alt="Create a Discord Activity with Playroom" />
</p>

3. Clone this project and install dependencies

```bash
    git clone https://github.com/Hugo-Dz/discord-activity-starter.git
    cd discord-activity-starter/client
    npm install
```

4. In the `client` folder, open the `.env` file and add your Playroom `Game ID`. You can find it in your Playroom project, under the `Game Overview` tab.

5. Launch the app locally

```bash
    # In the client folder
    npm run dev
```

6. In another terminal, run `cloudflared tunnel --url  http://localhost:5173` to create a tunnel for the client app. You need to have [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed.

7. Get the tunnel URL and put it in the URL Mapping in your Discord App in the [Discord developer portal](https://discord.com/developers/applications)

<p align="center">
  <img src="/assets/tunnelUrl.png" alt="Cloudflare Tunnnel URL" />
  <img src="/assets/urlMapping.png" alt="Discord Developer Portal" />
</p>

8. Turn the developer mode ON in Discord

<p align="center">
  <img src="/assets/devMode.png" alt="Discord Dev Mode settings" />
</p>

9. Launch the Activity!
   _Note: You have to be in a voice Channel._

<p align="center">
  <img src="/assets/startActivity.png" alt="Cloudflare Tunnnel URL" />
  <img src="/assets/selectActivity.png" alt="Discord Developer Portal" />
</p>

## Resources

- [3D Asset used](https://kenney.nl/assets/castle-kit) - Consider a donation to Kenney!
- [Discord Activity Tutorial](https://discord.com/developers/docs/activities/building-an-activity#step-1-creating-a-new-app)
- [Discord SDK App Starter](https://github.com/discord/embedded-app-sdk/tree/main/examples/discord-activity-starter)
- [HDRI Skybox texture](https://www.youtube.com/watch?v=_l8B7RdtOsU)
- Add multiplayer to your activity with [Playroom](https://docs.joinplayroom.com/components/discord)

## License

MIT License [Hugo Duprez](https://www.hugoduprez.com/)
