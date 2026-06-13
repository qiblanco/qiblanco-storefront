/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

import type {
  HydrogenContext,
  HydrogenSessionData,
  HydrogenEnv,
} from '@shopify/hydrogen';
import type {createAppLoadContext} from '~/lib/context';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  interface Env extends HydrogenEnv {
    FRESHDESK_API_KEY?: string;
    FRESHDESK_DOMAIN?: string;
    FRESHDESK_WITHDRAWAL_TICKET_TYPE?: string;
    FRESHDESK_WITHDRAWAL_FROM_EMAIL?: string;
    FRESHDESK_WITHDRAWAL_FIELD_ORDER_NUMBER?: string;
    FRESHDESK_WITHDRAWAL_FIELD_PRODUCT?: string;
    FRESHDESK_WITHDRAWAL_FIELD_EMAIL?: string;
    FRESHDESK_WITHDRAWAL_FIELD_RECEIVED_AT?: string;
    CONTACT_RATE_LIMIT?: KVNamespace;
    WITHDRAWAL_AUDIT_LOG?: KVNamespace;
    PUBLIC_ENABLE_TRACKING_IN_PREVIEW?: string;
  }
}

declare module 'react-router' {
  interface AppLoadContext
    extends Awaited<ReturnType<typeof createAppLoadContext>> {
    // to change context type, change the return of createAppLoadContext() instead
  }

  // TODO: remove this once we've migrated our loaders to `Route.LoaderArgs` 
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: remove this once we've migrated our loaders to `Route.ActionArgs`
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }

  interface SessionData extends HydrogenSessionData {
    // declare local additions to the Remix session data here
  }
}
