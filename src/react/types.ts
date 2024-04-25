export interface Field {
  name: string
  labelText?: string
  type?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  hint?: string
}

export type ClassName = React.HTMLProps<HTMLElement>['className']
