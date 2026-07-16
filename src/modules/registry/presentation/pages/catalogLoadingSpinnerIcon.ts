import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const [width, height, aliases, unicode, svgPathData] = faSpinner.icon
const duotonePaths = Array.isArray(svgPathData) ? svgPathData : [svgPathData, svgPathData]

export const faDuotoneSpinner: IconDefinition = {
  prefix: 'fad',
  iconName: 'spinner',
  icon: [width, height, aliases, unicode, duotonePaths],
}
