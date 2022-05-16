const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/Planner.vue") }],
    params: true,
  },

  {
    path: "/debug",
    component: () => import("layouts/GraphQLLayout.vue"),
    children: [{ path: "", component: () => import("pages/GraphQL.vue") }],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
