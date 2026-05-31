import { auth } from "@/lib/auth/server";

const handler = auth.handler();

type AuthPageContext = {
  params: Promise<{ page: string }>;
};

function toAuthPathContext({ params }: AuthPageContext) {
  return {
    params: params.then(({ page }) => ({ path: [page] })),
  };
}

export function GET(request: Request, context: AuthPageContext) {
  return handler.GET(request, toAuthPathContext(context));
}

export function POST(request: Request, context: AuthPageContext) {
  return handler.POST(request, toAuthPathContext(context));
}
