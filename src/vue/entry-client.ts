import { createSSRApp } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import createClientContext from "../core/entry-client.js";
import { getFullPath, withoutSuffix } from "../utils/route";
import { addPagePropsGetterToRoutes } from "./utils";
import type { ClientHandler, Context } from "./types";

import { provideContext } from "./components.js";

export { ClientOnly, useContext } from "./components.js";

export const ssr: ClientHandler = async function (
    App,
    { routes, base, routerOptions = {}, pageProps = { passToPage: true }, debug = {}, ...options },
    hook,
) {
    if (pageProps && pageProps.passToPage) {
        addPagePropsGetterToRoutes(routes);
    }

    const app = createSSRApp(App);

    const url = window.location;
    const routeBase = base && withoutSuffix(base({ url }), "/");
    const router = createRouter({
        ...routerOptions,
        history: createWebHistory(routeBase),
        routes: routes as RouteRecordRaw[],
    });

    const context: Context = await createClientContext({
        ...options,
        url,
        spaRedirect: (location) => router.push(location),
    });

    provideContext(app, context);

    let entryRoutePath: string | undefined;
    let isFirstRoute = true;
    router.beforeEach((to) => {
        if (isFirstRoute || (entryRoutePath && entryRoutePath === to.path)) {
            // The first route is rendered in the server and its state is provided globally.
            isFirstRoute = false;
            entryRoutePath = to.path;
            to.meta.state = context.initialState;
        }
    });

    if (hook) {
        await hook({
            app,
            router,
            initialRoute: router.resolve(getFullPath(url, routeBase)),
            ...context,
        });
    }

    app.use(router);

    if (debug.mount !== false) {
        // this will hydrate the app
        await router.isReady();
        // @ts-ignore
        app.mount(`#${__CONTAINER_ID__}`, true);
    }
};

export default ssr;
