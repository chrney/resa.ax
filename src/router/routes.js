const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      //
      { path: "", component: () => import("pages/Planner.vue") },
      //
      /*
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "/sok", component: () => import("pages/Planner.vue") },
            { path: "/linjer", component: () => import("pages/Lines.vue") },
            { path: "/linje/:lineId", component: () => import("pages/LinesMap.vue") },
            {
              path: "/hallplats/:stopId",
              component: () => import("pages/StopPoint.vue"),
            },
       */
    ],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
