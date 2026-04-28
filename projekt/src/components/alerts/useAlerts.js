import { useNotivue } from "notivue"

export function useAlerts() {
  const { notify } = useNotivue()

  function success(message, options = {}) {
    notify.success(message, {
      duration: 3000,
      ...options,
    })
  }

  function error(message, options = {}) {
    notify.error(message, {
      duration: 4000,
      ...options,
    })
  }

  function warning(message, options = {}) {
    notify.warning(message, {
      duration: 3500,
      ...options,
    })
  }

  function info(message, options = {}) {
    notify.info(message, {
      duration: 3000,
      ...options,
    })
  }

  return {
    success,
    error,
    warning,
    info,
  }
}
