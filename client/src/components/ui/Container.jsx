import { cn } from '@/lib/utils';

/**
 * Centered responsive max-width layout container
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Inner container content
 * @param {string} [props.className] - Additional CSS classes
 * @param {keyof HTMLElementTagNameMap} [props.as='div'] - Semantic HTML element
 * @returns {JSX.Element}
 */
export function Container({ children, className = '', as: Component = 'div', ...rest }) {
  return (
    <Component
      className={cn('mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8', className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Container;
