# Crater Documentation

This folder contains the documentation website for **Crater**, free and open-source worship projection software for churches. It is published at https://crater.voyagerlabs.tech/.

The docs describe the Qt version of Crater (source: https://github.com/vygr-labs/crater-v2). Download links point at that repository's releases, and `docs/js/latest-release.js` swaps in the newest release's files when the page loads.

## Documentation Structure

```
docs/
├── index.md                    # Welcome, download, quick start
├── downloads.md                # Downloads, checksums, system requirements
├── faq.md                      # Frequently Asked Questions
├── js/latest-release.js        # Points download links at the latest release
├── getting-started/
│   ├── installation.md         # Install, update, uninstall
│   ├── first-launch.md         # Projection screen setup
│   └── interface-overview.md   # Console tour
├── features/
│   ├── scriptures.md           # Scripture tab
│   ├── strongs.md              # Strong's concordance
│   ├── songs.md                # Song library
│   ├── media.md                # Pictures, videos, PDFs
│   ├── presentations.md        # Sermon slides and speaker notes
│   ├── themes.md               # Themes, defaults, sharing
│   ├── schedules.md            # Order of service
│   ├── outputs.md              # Multiple outputs, stage monitor, TV cast
│   └── ndi-streaming.md        # NDI output
├── guides/
│   ├── displaying-content.md   # Running a service (Preview and Live)
│   ├── quick-search.md         # Global search (Ctrl+K)
│   ├── managing-songs.md       # Song editor and collections
│   ├── importing-songs.md      # EasyWorship import
│   └── creating-themes.md      # Theme editor and AI design
└── reference/
    ├── keyboard-shortcuts.md   # Shortcuts
    ├── settings.md             # Every settings option
    └── troubleshooting.md      # Common issues, data folder, backups
```

The sidebar order is set by `nav` in `mkdocs.yml`. Add new pages there.

## Building the Documentation

This documentation site is built with [MkDocs](https://www.mkdocs.org/).

### Prerequisites

- Python 3.x
- pip

### Installation

```bash
pip install mkdocs
pip install mkdocs-shadcn  # Theme
```

### Development

```bash
# Serve locally with live reload
mkdocs serve

# Build static site
mkdocs build
```

The built site will be output to the `site/` folder.

## Creator

**Eyetu Kingsley**  
Software Developer based in Lagos, Nigeria

## License

Crater is free and open-source software under the GPL-3.0 licence.

---

*For user documentation, visit the [docs](./docs/) folder or the live documentation site.*
