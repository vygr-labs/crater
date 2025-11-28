# Crater Bible Project Documentation

This folder contains the documentation website for **Crater Bible Project**, a free and open-source scripture projection software.

## About the Project

Crater is designed to help churches and worship teams display scriptures, songs, and media during services. Built with simplicity in mind, it's accessible to users of all technical backgrounds.

### Key Features

- **Scripture Display** - Multiple Bible translations with instant search
- **Song Library** - Full-featured song management with built-in editor
- **Media Support** - Display images and videos
- **Custom Themes** - Visual theme editor with real-time preview
- **Service Schedules** - Plan and organize your services

## Documentation Structure

```
docs/
├── index.md                    # Welcome & Quick Start
├── faq.md                      # Frequently Asked Questions
├── getting-started/
│   ├── installation.md         # Download & Install
│   ├── first-launch.md         # Initial Setup
│   └── interface-overview.md   # UI Walkthrough
├── features/
│   ├── scriptures.md           # Scripture Features
│   ├── songs.md                # Song Library
│   ├── media.md                # Media Handling
│   ├── themes.md               # Theme System
│   └── schedules.md            # Service Schedules
├── guides/
│   ├── displaying-content.md   # Display Workflow
│   ├── quick-search.md         # Search Features
│   ├── creating-themes.md      # Theme Editor Guide
│   └── managing-songs.md       # Song Management
└── reference/
    ├── keyboard-shortcuts.md   # Shortcuts
    ├── settings.md             # Configuration
    └── troubleshooting.md      # Common Issues
```

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

Crater Bible Project is free and open-source software. See the [LICENSE.md](../LICENSE.md) file in the project root for details.

---

*For user documentation, visit the [docs](./docs/) folder or the live documentation site.*
