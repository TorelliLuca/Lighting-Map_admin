export const Separator = ({
  className = "",
  orientation = "horizontal",
  ...props
}) => {
  return (
    <div
      className={`shrink-0 bg-slate-700/50 ${
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px"
      } ${className}`}
      {...props}
    />
  )
}
