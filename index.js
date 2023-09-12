import { Hono } from "hono"
import { serveStatic } from "@hono/node-server/serve-static"
import { serve } from "@hono/node-server"

const app = new Hono()

// Serve Static files
app.use("/static/*", serveStatic({ root: "./" }))

// Routes
import { mainRoute } from "./routes/mainRoute.js"
import { markdownRoute } from "./routes/markdownRoute.js"

app.route("/", mainRoute)
app.route("/", markdownRoute)

serve(app, ({ port }) => {
	console.log(`Listening on http://localhost:${port}`)
})
