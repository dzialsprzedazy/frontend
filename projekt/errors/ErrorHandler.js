import CustomError from "./CustomError.js"

export const createCustomError = (message) => new CustomError(message)

export const handleErrors = (error, fetchError) => {
  if (error.response) {
    // 1. Serwer odpowiedział kodem spoza zakresu 2xx (np. 404, 500)
    const errorMessage =
      error.response.data?.Error || error.response.data?.error || "Błąd serwera"
    console.error(
      "Błąd odpowiedzi (Server Error):",
      error.response.status,
      errorMessage,
    )
    fetchError.value = createCustomError(errorMessage)
  } else if (error.request) {
    // 2. Żądanie zostało wysłane, ale nie otrzymano żadnej odpowiedzi (np. brak internetu, CORS, timeout)
    console.error("Błąd połączenia (No Response):", error.request)

    let msg = "Brak odpowiedzi od serwera. Sprawdź połączenie internetowe."
    if (error.code === "ECONNABORTED")
      msg = "Przekroczono czas oczekiwania na odpowiedź."
    if (error.code === "ERR_NETWORK")
      msg = "Błąd sieciowy – serwer może być nieosiągalny."

    fetchError.value = createCustomError(msg)
  } else {
    // 3. Coś poszło nie tak podczas ustawiania żądania (błąd w kodzie JS)
    console.error("Błąd krytyczny (Request Setup):", error.message)
    fetchError.value = createCustomError(`Błąd aplikacji: ${error.message}`)
  }
}
