---
title: FAQ
description: Answers to common questions about Crater, the free worship projection software for churches.
---

# Frequently Asked Questions

## General

### What is Crater?

Crater is free, open-source worship projection software. It shows Bible verses, song lyrics, pictures, videos, PDFs and sermon slides on a projector, TV or live stream during church services.

### Is it really free?

Yes. There's no licence to buy, no subscription and no trial period. Install it on every computer in the church. Crater is open source under the GPL-3.0 licence, and anyone can [read the code](https://github.com/vygr-labs/crater-v2).

### Which computers does it run on?

Windows 10 and 11 (64-bit), and macOS 14 Sonoma or later on both Intel and Apple Silicon Macs. There's no Linux version yet. See [system requirements](downloads.md#system-requirements).

### Will it run on our old church laptop?

Very likely. Crater is built to run well on modest hardware: 4 GB of RAM and the kind of integrated graphics found in laptops from around 2012 onwards.

### Does it need the internet?

No. Everything works offline. Crater only goes online if you allow it to check for updates (once a day, which you can turn off in **Settings > Updates**) or when you choose to send logs to the developer.

### Is our information private?

Yes. There are no accounts, no analytics and no tracking. Your songs, schedules and media stay on your computer.

### Is Crater available in my language?

The console is available in 21 languages, including Spanish, French, Portuguese, German, Swahili, Hindi, Chinese, Korean, Japanese and Arabic. Crater picks your computer's language automatically, and you can change it in **Settings > Appearance > Language**.

## Moving to Crater

### Can we bring our songs over from EasyWorship?

Yes, from EasyWorship 6 and 7. Crater imports titles, authors, copyright, CCLI numbers and lyrics split into sections. See [Importing from EasyWorship](guides/importing-songs.md).

### What about ProPresenter, OpenLP or other programs?

Only EasyWorship imports are supported at the moment. Songs from other programs can be pasted into the song editor's **Raw text** view, a whole song at a time.

## Setup

### Can I use Crater with only one screen?

Yes. The projection shows as a small preview in the corner, or full size behind the console if you turn on **Settings > Projection > Single display: full-size projection behind the console**. This is handy for preparing a service at home.

### Can I use more than two screens?

Yes. Besides the main projection, you can add a stage monitor and as many mirror screens as your computer can drive, each on its own display. See [Outputs and Stage Display](features/outputs.md).

### Can the preacher see their notes?

Yes. Write speaker notes on your [presentation](features/presentations.md) slides and turn on a [stage monitor](features/outputs.md#stage-monitor). The notes, the next slide and a clock show on the stage screen and never on the congregation's screen.

### Can we send the screen to our live stream?

Yes, over your network with NDI, into OBS, vMix, Streamlabs and other streaming software. You can even give the stream its own look, like a lower third. See [NDI Streaming](features/ndi-streaming.md). NDI is available on Windows.

### Can I control Crater from my phone?

Not yet. Phone remote control is planned. For now, you can show the live projection in a phone or TV browser with **Cast to TV browser**. See [Casting to a TV browser](features/outputs.md#casting-to-a-tv-browser).

## Scripture

### Which Bible translations are included?

Fourteen English translations: AMPC, ASV, CEV, ESV, GNT, KJV, MSG, NASB2020, NIV, NKJV, NLT, RSV, TLV and TPT. See [Scripture](features/scriptures.md#included-translations).

### Can I add other translations?

Not yet. Adding your own translations isn't supported.

### What's the fastest way to show a verse someone calls out?

On the Scripture tab, type the reference (`rom 8 28` works) and press **Enter**. From any other tab, press **Ctrl + K**, type the reference and press **Enter** to load it into Preview.

## Songs

### How do I add songs?

Click **+** on the Songs tab. Type or paste the lyrics, one section per slide. See [Managing Songs](guides/managing-songs.md).

### Can I make parts of a lyric bold or coloured?

Yes. Select the words and use the bold, italic, underline and colour buttons in the song editor.

### Can I change a song for one service only?

Yes. Right-click the song in the schedule and choose **Edit…**, then **Save to Schedule**. The library copy stays as it was. See [Schedules](features/schedules.md#editing-an-item-without-changing-the-library).

## During the service

### How do I move to the next slide?

Click the slide in the Live panel, or click in the Live panel and press **Down**. To find a slide without showing the ones in between, hold **Ctrl** and press **Up** or **Down**, then let go of **Ctrl**.

### How do I quickly clear the screen?

Click **Clear** or press **Ctrl + C**. The text disappears and the background stays. Press it again to bring the text back. **Logo** (**Ctrl + L**) shows your logo instead.

### What if the worship leader repeats a section?

Click that section in the Live panel. Each section of a song is a separate slide, labelled with its name.

## Data

### Where does Crater store our songs and settings?

In a data folder on your computer. See [Where Crater keeps your data](reference/troubleshooting.md#where-crater-keeps-your-data).

### Will updating delete our songs?

No. Updates keep your songs, themes, schedules, media and settings.

### How do we back up?

Close Crater and copy its data folder somewhere safe. See [Backing up](reference/troubleshooting.md#backing-up).

## Help and support

### Where do I report a bug or suggest a feature?

[Open an issue on GitHub](https://github.com/vygr-labs/crater-v2/issues). For a bug, you can also send your log from **Settings > Diagnostics**.

### How can I contact the developer?

Email eyetukingsley330@gmail.com.

### How can we support the project?

- [Star the repository on GitHub](https://github.com/vygr-labs/crater-v2) so other churches can find it.
- Tell other churches about Crater.
- Report bugs and suggest improvements.
- Contribute code or translations.
