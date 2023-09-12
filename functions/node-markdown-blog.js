import { readFileSync } from "node:fs"
import { readdir } from "node:fs/promises"

class NodeMarkdownBlog {
	// Method to parse front-matter from Markdown files.
	parseFrontMatter(text, delimiter = "---") {
		const lines = text.split("\n")
		const frontmatter = {}

		let i = 0
		if (!lines[i].startsWith(delimiter)) {
			throw new Error("Front matter delimiter not found.")
		}

		i++
		while (i < lines.length && !lines[i].startsWith(delimiter)) {
			const line = lines[i].trim()
			const separatorIndex = line.indexOf(":")
			if (separatorIndex === -1) {
				throw new Error(`Invalid front matter syntax: ${line}`)
			}
			const key = line.slice(0, separatorIndex).trim()
			let value = line.slice(separatorIndex + 1).trim()

			// Check if value is wrapped in brackets
			if (value.startsWith("[") && value.endsWith("]")) {
				// Remove brackets and split into array elements
				const trimmedValue = value.slice(1, -1).trim()
				if (trimmedValue.length > 0) {
					value = trimmedValue.split(",").map((item) => item.trim())
				} else {
					value = []
				}
			}

			frontmatter[key] = value
			i++
		}

		if (i === lines.length) {
			throw new Error("End of front matter not found.")
		}

		const content = lines.slice(i + 1).join("\n")

		return {
			frontmatter,
			content,
		}
	}

	// Method to get files from their directory recursively.
	async getFiles(dirName) {
		let files = []
		const items = await readdir(dirName, { withFileTypes: true })

		try {
			for (const item of items) {
				if (item.isDirectory()) {
					files = [...files, ...(await getFiles(`${dirName}/${item.name}`))]
				} else {
					files.push(`${dirName}/${item.name}`)
				}
			}
		} catch (error) {
			console.error(error)
		}

		return files
	}

	// Method to get the pages and posts data.
	async getMarkdownData(dirname) {
		const files = await getFiles(dirname)
		const mdFiles = files.filter((file) => file.endsWith(".md"))
		const data = []

		mdFiles.forEach((file) => {
			const fileName = file.split("/").pop()
			const contents = readFileSync(file, "utf-8")
			const fileData = parseFrontMatter(contents)
			const filePath = `${dirname}/${fileName}`
			const fileDir = filePath.split("/")[1]
			const obj = { 0: fileName, 1: fileData }
			obj.path = filePath
			obj.dir = fileDir
			data.push(obj)
		})

		return data
	}

	// Method to get the pages data.
	getPages() {
		const pagesData = getMarkdownData("views/pages")
		return pagesData
	}

	// Method to get the posts data.
	async getPosts() {
		const postsData = await getMarkdownData("views/posts")
		const newPostsData = postsData
			.map((obj) => {
				return { ...obj, date: new Date(obj[1].frontmatter.date) }
			})
			.sort((objA, objB) => Number(objB.date) - Number(objA.date))

		return newPostsData
	}
}

export const { parseFrontMatter, getFiles, getMarkdownData, getPages, getPosts } = new NodeMarkdownBlog()
