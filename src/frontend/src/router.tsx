import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type RouterCtx = {
  path: string;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterCtx>({
  path: "/",
  navigate: () => {},
});

function getPath() {
  const hash = window.location.hash.slice(1);
  return hash || "/";
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handler = () => setPath(getPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo(0, 0);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function useLocation() {
  const { path } = useContext(RouterContext);
  return { pathname: path };
}

export function useParams<T extends Record<string, string>>(
  pattern: string,
): T {
  const { path } = useContext(RouterContext);
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i]?.startsWith(":")) {
      params[patternParts[i].slice(1)] = pathParts[i] ?? "";
    }
  }
  return params as T;
}

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

export function usePath() {
  return useContext(RouterContext).path;
}
