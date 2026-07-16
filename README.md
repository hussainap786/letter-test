# A Special Delivery 💌

A nine-scene interactive love letter: night sky → postman → lilies →
envelope → typewriter letter → live "since we met" counter → playlist/TikTok
links → falling-petal ending.

**Everything is drawn with pure HTML/CSS** (night sky, stars, moon, envelope,
speech bubble, falling petals) **except the postman and the lily bouquet**,
which are hand-illustrated SVG — and even those are written directly inside
`index.html` itself rather than as separate files. There is nothing under an
`assets/` folder to upload, misplace, or 404 on. Just four files, all at the
same level:

```
A-Special-Delivery/
├── index.html   all scenes + the postman/bouquet illustrations
├── style.css    every color, animation, and the CSS-drawn moon/envelope/petals
├── script.js    CONFIG (edit this) + the scene engine
└── music.mp3    your song — plays once when the envelope opens
```

## 1. Customize your content

Open **`script.js`** and edit the `CONFIG` object at the very top:

| Field | What it is |
|---|---|
| `speechArrive` / `speechLilies` / `speechEnvelope` | What the postman says at each step |
| `letterGreeting` / `letterBody` / `letterSignoff` | Your actual letter. Use `\n\n` for a paragraph break |
| `metSince` | The exact date & time you met, `"YYYY-MM-DDTHH:MM:SS"` — powers the live timer |
| `timerCaption` | The line under the timer card |
| `playlistUrl` | Your Spotify playlist link |
| `tiktokUrl` | Your TikTok link |
| `finalNote` | The note revealed by the "Final Note" button |

## 2. Publish on GitHub Pages

1. Create a new **public** repo, e.g. `a-special-delivery`.
2. Upload all four files — `index.html`, `style.css`, `script.js`, `music.mp3` — straight into the repo root. No folders needed this time.
3. Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
4. Your site is live at `https://<your-username>.github.io/a-special-delivery/`

## Notes

- **Vibration** (`navigator.vibrate()`) only works on Android Chrome — iPhones don't support it, so it silently does nothing there rather than breaking anything.
- **Music** plays once, starting the moment the envelope opens, and fades out during the ending. Mobile browsers require a tap before any audio can play — that's what the first "Open" button unlocks.
