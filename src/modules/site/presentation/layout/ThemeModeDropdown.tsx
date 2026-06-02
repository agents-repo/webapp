import { faCheck, faCircleHalfStroke, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dropdown } from 'react-bootstrap'
import { type ThemeMode } from '../../application/theme/themeMode'
import { useThemeMode } from '../../application/theme/themeModeContext'

interface ThemeModeOption {
  readonly mode: ThemeMode
  readonly label: string
  readonly icon: typeof faSun
}

const themeModeOptions: readonly ThemeModeOption[] = [
  { mode: 'light', label: 'Light', icon: faSun },
  { mode: 'dark', label: 'Dark', icon: faMoon },
  { mode: 'auto', label: 'Auto', icon: faCircleHalfStroke },
]

function ThemeModeDropdown() {
  const { mode, setMode } = useThemeMode()
  const activeOption = themeModeOptions.find((option) => option.mode === mode) ?? themeModeOptions[1]

  return (
    <Dropdown align="end" className="theme-mode-dropdown">
      <Dropdown.Toggle
        id="theme-mode-dropdown"
        variant="link"
        className="d-inline-flex align-items-center justify-content-center app-header-icon-control"
        aria-label={`Color mode: ${activeOption.label}`}
        title={`Color mode: ${activeOption.label}`}
      >
        <FontAwesomeIcon icon={activeOption.icon} className="fa-fw" aria-hidden="true" />
      </Dropdown.Toggle>

      <Dropdown.Menu data-bs-theme="dark">
        {themeModeOptions.map((option) => (
          <Dropdown.Item
            key={option.mode}
            as="button"
            type="button"
            className="d-flex align-items-center gap-2"
            active={mode === option.mode}
            onClick={() => {
              setMode(option.mode)
            }}
          >
            <FontAwesomeIcon icon={option.icon} className="fa-fw" aria-hidden="true" />
            <span className="flex-grow-1">{option.label}</span>
            {mode === option.mode ? <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> : null}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default ThemeModeDropdown
