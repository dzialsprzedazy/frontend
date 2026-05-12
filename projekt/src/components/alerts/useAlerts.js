import { usePush } from "notivue"

export function useAlerts() {
  const push = usePush()

  const showAlert = ({ type = "info", message, duration }) => {
    const options = { message }

    if (duration !== undefined) {
      options.duration = duration
    } else if (type === "error") {
      options.duration = 45000
    }

    if (type === "success") {
      push.success(options)
    } else if (type === "error") {
      push.error(options)
    } else if (type === "warning") {
      push.warning(options)
    } else {
      push.info(options)
    }
  }

  return { showAlert }
}
