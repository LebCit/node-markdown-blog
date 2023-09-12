import { join } from "path"
import { Hono } from "hono"
import { Eta } from "eta"
import { getPosts } from "../functions/node-markdown-blog.js"

const app = new Hono()
const eta = new Eta({ views: join(process.cwd(), "views") })

export const mainRoute = app.get("/", async (c) => {
	// Main Route data
	const data = {
		title: "Home",
		description: "List of the most recent posts",
	}

	const res = eta.render("layouts/base.html", {
		// Passing Route data
		mainRoute: true,
		// Passing document data
		data: data,
		posts: await getPosts(),
		// Passing needed settings for the template
		siteTitle: "Markdown-based blog",
	})
	return c.html(res)
})
