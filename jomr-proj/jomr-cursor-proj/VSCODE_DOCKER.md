# Running Docker in VS Code

This guide explains multiple ways to run your Docker containers directly within VS Code.

## Method 1: Using VS Code Integrated Terminal (Simplest)

This is the easiest way to run Docker containers in VS Code.

### Steps:

1. **Open VS Code Terminal**
   - Press `` Ctrl+` `` (backtick) or go to `Terminal > New Terminal`
   - Or use `View > Terminal`

2. **Navigate to Project Directory**
   ```bash
   cd jomr-proj/jomr-cursor-proj
   ```

3. **Run Docker Commands**
   
   **Development Mode (with hot reload):**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```
   
   **Production Mode:**
   ```bash
   docker-compose up --build
   ```

4. **View Logs**
   - Logs will appear directly in the terminal
   - Press `Ctrl+C` to stop the containers

### Benefits:
- ✅ Simple and straightforward
- ✅ See all logs in real-time
- ✅ Works immediately, no extensions needed
- ✅ Can use multiple terminal panes for different containers

---

## Method 2: Using Docker Extension (Visual Management)

The Docker extension provides a visual interface to manage containers.

### Installation:

1. **Install Docker Extension**
   - Open VS Code Extensions (`Ctrl+Shift+X`)
   - Search for "Docker" by Microsoft
   - Click "Install"

2. **Verify Docker is Running**
   - Ensure Docker Desktop is running on your system

### Usage:

1. **View Containers**
   - Click the Docker icon in the left sidebar
   - You'll see all Docker containers, images, and volumes

2. **Start Containers**
   - Right-click on `docker-compose.yml` in the explorer
   - Select "Compose Up" or "Compose Up (Detached)"
   - Or use the Docker extension panel

3. **Manage Containers**
   - Start/Stop containers with right-click menu
   - View logs directly in VS Code
   - Inspect container details
   - Execute commands in running containers

### Benefits:
- ✅ Visual container management
- ✅ Easy access to logs and container details
- ✅ Integrated with VS Code interface

---

## Method 3: Dev Containers (Most Integrated)

Dev Containers allows you to develop entirely inside a Docker container with full VS Code integration.

### Installation:

1. **Install Dev Containers Extension**
   - Open Extensions (`Ctrl+Shift+X`)
   - Search for "Dev Containers" by Microsoft
   - Click "Install"

2. **Required Extensions** (auto-installed):
   - Docker
   - Remote - Containers

### Usage:

1. **Open in Container**
   - Press `F1` or `Ctrl+Shift+P`
   - Type "Dev Containers: Reopen in Container"
   - Select it from the list
   - VS Code will build and start the container

2. **First Time Setup**
   - VS Code will detect `.devcontainer/devcontainer.json`
   - It will build the container automatically
   - Your workspace will reopen inside the container

3. **Terminal**
   - All terminals will run inside the container
   - The dev server will be available at `http://localhost:3000`

4. **Extensions**
   - Extensions listed in `devcontainer.json` will be auto-installed
   - They run inside the container

### Benefits:
- ✅ Full VS Code integration inside container
- ✅ Consistent development environment
- ✅ Automatic port forwarding
- ✅ Extensions run in container
- ✅ Same environment for all team members

### Configuration:

The `.devcontainer/devcontainer.json` file is already configured:
- Uses `docker-compose.dev.yml`
- Auto-forwards port 3000
- Installs recommended extensions
- Sets up Node.js environment

---

## Quick Comparison

| Method | Difficulty | Integration | Best For |
|--------|-----------|-------------|----------|
| **Integrated Terminal** | Easy | Low | Quick testing, simple workflows |
| **Docker Extension** | Easy | Medium | Visual management, debugging |
| **Dev Containers** | Medium | High | Full containerized development |

---

## Recommended Workflow

### For Development:
```bash
# Use Dev Containers or integrated terminal with dev compose
docker-compose -f docker-compose.dev.yml up
```

### For Testing Production Build:
```bash
# Use integrated terminal
docker-compose up --build
```

---

## Useful VS Code Tasks

You can also create VS Code tasks for easier Docker management. Add this to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Docker: Dev Up",
      "type": "shell",
      "command": "docker-compose",
      "args": ["-f", "docker-compose.dev.yml", "up", "--build"],
      "problemMatcher": []
    },
    {
      "label": "Docker: Dev Down",
      "type": "shell",
      "command": "docker-compose",
      "args": ["-f", "docker-compose.dev.yml", "down"],
      "problemMatcher": []
    },
    {
      "label": "Docker: Production Up",
      "type": "shell",
      "command": "docker-compose",
      "args": ["up", "--build"],
      "problemMatcher": []
    }
  ]
}
```

Then run tasks with `Ctrl+Shift+P` > "Tasks: Run Task"

---

## Troubleshooting

### Port Already in Use
- VS Code may show a notification to forward the port
- Or change the port in `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000"  # Use 3001 on host
  ```

### Container Not Starting
- Check Docker Desktop is running
- View output in VS Code terminal
- Check Docker extension logs

### Dev Containers Not Working
- Ensure Docker is running
- Check `.devcontainer/devcontainer.json` syntax
- View Dev Containers output: `View > Output > Dev Containers`

### Environment Variables Not Loading
- Ensure `.env.local` exists in project root
- Restart VS Code and container
- Check environment variables in container: `docker-compose exec app env`

---

## Tips

1. **Multiple Terminals**: Open multiple terminal panes to run multiple commands
2. **Watch Mode**: VS Code can auto-reload when files change (Dev Containers)
3. **Debugging**: Use VS Code debugger with port forwarding
4. **Extensions**: Some extensions work better in Dev Containers (like ESLint, Prettier)

---

## Next Steps

- Try Method 1 (Integrated Terminal) for quick start
- Install Docker extension for visual management
- Explore Dev Containers for full containerized development

For more details, see [DOCKER.md](./DOCKER.md).
