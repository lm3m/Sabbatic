# Sabbatic - Widget Dashboard

A customizable widget dashboard built with Vue 3, featuring draggable and resizable widgets that display dynamic data from various sources.

## Features

- **Draggable & Resizable Widgets**: Arrange your dashboard layout with drag-and-drop functionality
- **Multiple Widget Types**:
  - **Chart**: Line, bar, doughnut, and pie charts with support for external data APIs
  - **Image**: Display images with optional auto-refresh
  - **Data**: Fetch and display JSON data from APIs
  - **Embed**: Embed external websites via iframe
  - **Spotify**: View currently playing track with playback controls
  - **Clock**: LCD-style date/time display with customizable colors
  - **Oblique Strategies**: Daily creative prompts with customizable typography
- **Persistent Layout**: Dashboard configuration saved to localStorage
- **Dark Theme**: Modern dark interface optimized for visibility

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`)
- **Vite** for fast development and optimized builds
- **grid-layout-plus** for drag-and-drop grid system
- **Chart.js** with vue-chartjs for data visualization
- **Axios** for HTTP requests

## Project Structure

```
src/
├── App.vue                    # Main dashboard layout and state
├── main.js                    # Vue app entry point
├── style.css                  # Global styles
├── components/
│   ├── WidgetContainer.vue    # Widget wrapper with header/controls
│   └── WidgetSettings.vue     # Settings modal for widget configuration
├── widgets/
│   ├── ChartWidget.vue        # Chart visualization widget
│   ├── DataWidget.vue         # JSON data display widget
│   ├── DateTimeWidget.vue     # LCD clock widget
│   ├── IframeWidget.vue       # Embedded website widget
│   ├── ImageWidget.vue        # Image display widget
│   ├── ObliqueStrategiesWidget.vue  # Creative prompts widget
│   └── SpotifyWidget.vue      # Spotify now playing widget
├── services/
│   └── spotify.js             # Spotify API integration
public/
└── ObliqueStrategies-Edition-1975.txt  # Oblique Strategies card data
```

## Design Decisions

### Component Architecture

- **Separation of concerns**: Each widget type is a standalone component receiving only `config` and `refreshKey` props
- **Centralized settings**: `WidgetSettings.vue` handles configuration for all widget types with type-specific sections
- **Event-driven updates**: Widgets emit events (`remove`, `refresh`, `update-settings`) handled by the parent

### State Management

- **Local state**: Uses Vue's reactivity system with `ref()` and `computed()` - no external store needed
- **Persistence**: Layout and widget configurations saved to localStorage on every change
- **Deep cloning**: Widget configs are deep-cloned when editing to prevent unintended mutations

### Styling

- **Scoped CSS**: Each component uses scoped styles to prevent leakage
- **CSS Variables**: Dynamic theming (e.g., clock display color) uses CSS custom properties
- **Dark theme**: Consistent dark color palette (#0a0a0a background, #1a1a1a cards, #333 borders)

### Widget-Specific Implementation

#### Spotify Widget
- OAuth 2.0 flow with authorization code grant
- Credentials stored in localStorage (client-side only)
- Automatic token refresh when expired
- Playback controls require Spotify Premium

#### DateTime Widget
- Real-time updates via `setInterval`
- Configurable 12/24-hour format
- Dynamic color theming with computed glow effects
- ISO week number calculation

#### Oblique Strategies Widget
- Date-based deterministic card selection using hash function
- "Draw new card" overrides cached in localStorage for the day
- Customizable typography (font family, size, color, bold, italic, uppercase)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:5173`

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker compose up -d

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

The app will be available at `http://localhost:8080`

### Manual Docker Build

```bash
# Build the image
docker build -t sabbatic .

# Run the container
docker run -d -p 8080:80 --name sabbatic-dashboard sabbatic
```

### Docker Configuration

The Docker setup uses a multi-stage build for optimal image size:

1. **Build stage**: Node.js Alpine image compiles the Vue application
2. **Production stage**: Nginx Alpine serves the static files (~25MB final image)

**Included optimizations**:
- Gzip compression for faster loading
- Cache headers for static assets (1 year for immutable files)
- SPA routing (all routes serve index.html)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Health check endpoint

### Docker Files

- `Dockerfile` - Multi-stage build configuration
- `docker-compose.yml` - Simple deployment with health checks
- `nginx.conf` - Production nginx configuration
- `.dockerignore` - Excludes unnecessary files from build context

## Adding New Widgets

1. Create a new component in `src/widgets/`:
   ```vue
   <template>
     <div class="my-widget">
       <!-- Widget content -->
     </div>
   </template>

   <script setup>
   const props = defineProps({
     config: { type: Object, required: true },
     refreshKey: { type: Number, default: 0 }
   })
   </script>
   ```

2. Register in `WidgetContainer.vue`:
   - Import the component
   - Add a `v-else-if` case in the template

3. Add settings in `WidgetSettings.vue`:
   - Add a settings section with `v-if="widget.type === 'mywidget'"`
   - Add default value initialization in `initSettings()`

4. Add to `App.vue`:
   - Add a button in the header
   - Add a case in `getDefaultConfig()`

## License

ISC
