import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("login", "routes/client/login.tsx"),
	route("client", "routes/client/layout.tsx", [
		index("routes/client/dashboard.tsx"),
		route("inbox", "routes/client/inbox.tsx"),
		route("audio", "routes/client/audio.tsx"),
	]),
	route("admin/login", "routes/admin/login.tsx"),
	route("admin", "routes/admin/layout.tsx", [
		index("routes/admin/users.tsx"),
		route("users/new", "routes/admin/user-create.tsx"),
		route("users/:id", "routes/admin/user-edit.tsx"),
		route("backups", "routes/admin/backups.tsx"),
		route("backups/history", "routes/admin/backup-history.tsx"),
	]),
] satisfies RouteConfig;
