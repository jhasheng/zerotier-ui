import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "./Input";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ containerClassName, className, ...rest }, ref) {
    return (
      <div className={cn("relative", containerClassName)}>
        <Search
          className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          className={cn("pl-8", className)}
          {...rest}
        />
      </div>
    );
  },
);
