import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const spinnerPath = faSpinner.icon[4]
const duotonePaths = Array.isArray(spinnerPath) ? spinnerPath : [spinnerPath, spinnerPath]

export const faDuotoneSpinner: IconDefinition = {
  prefix: 'fad',
  iconName: 'spinner',
  icon: [faSpinner.icon[0], faSpinner.icon[1], faSpinner.icon[2], faSpinner.icon[3], duotonePaths],
}
