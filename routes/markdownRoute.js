import { join } from "path"
import { Hono } from "hono"
import { Eta } from "eta"
import { marked } from "marked"
import { getPages, getPosts } from "../functions/node-markdown-blog.js"

const app = new Hono()
const eta = new Eta({ views: join(process.cwd(), "views") })

export const markdownRoute = app.get("/:folder/:filename", async (c, next) => {
	// Merge the pages and the posts arrays into a single array named mdFiles
	const pages = await getPages()
	const posts = await getPosts()
	const mdFiles = pages.concat(posts)

	const currentFile = mdFiles.find(
		(file) => file.path === `views/${c.req.param("folder")}/${c.req.param("filename")}.md`
	)

	if (currentFile) {
		const fileData = currentFile[1].frontmatter
		const fileContent = marked.parse(currentFile[1].content)
		const fileDirectory = currentFile.dir
		const res = eta.render("layouts/base.html", {
			// Passing Route data
			mdRoute: true,
			// Passing Markdown file data
			data: fileData,
			content: fileContent,
			dirname: fileDirectory,
			// Passing needed settings for the template
			siteTitle: "Markdown-based blog",
		})
		return c.html(res)
	} else {
		// Proceed to the 404 route if no file is found
		await next()
	}
})
