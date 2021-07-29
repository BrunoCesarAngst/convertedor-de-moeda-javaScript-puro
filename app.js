/*
  - Construa uma aplicação de conversão de moedas. O HTML e CSS são os que você
    está vendo no browser;
  - Você poderá modificar a marcação e estilos da aplicação depois. No momento, 
    concentre-se em executar o que descreverei abaixo;
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    - Para obter as moedas com os valores já convertidos, use a Exchange rate 
      API: https://www.exchangerate-api.com/;
      - Para obter a key e fazer requests, você terá que fazer login e escolher
        o plano free. Seus dados de cartão de crédito não serão solicitados.
*/

const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');

const currenciesEl = document.querySelector('[data-js="currencies-container"]');

const convertedValueEl = document.querySelector('[data-js="converted-value"]')

const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')

const timesCurrencyEl = document.querySelector('[data-js="currency-one-times"]')

let internalExchangeRate = {}

const url =
  "https://v6.exchangerate-api.com/v6/ae3951b7a5df6c73424f0705/latest/USD";

const getErrorMessage = (errorType) =>
  ({
    "unsupported-code":
      "Desculpa, essa moeda não existe em nosso banco de dados.",
    "malformed-request":
      "O endpoint dessa request não segue a estrutura padrão. Mais informações: https://www.exchangerate-api.com/docs/standard-requests",
    "invalid-key": "Chave API inválida.",
    "quota-reached": "A conta atingiu o limite.",
    "not-available-on-plan": "Ação não permitida.",
  }[errorType] || "Não foi possível obter as informações.");

const fetchExchangeRate = async () => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Sua conexão falhou, nào foi possível obter as informações."
      );
    }

    // console.log(await response.json())
    const exchangeRateData = await response.json();

    if (exchangeRateData.result === "error") {
      throw new Error(getErrorMessage(exchangeRateData["error-type"]));
    }

    return exchangeRateData;
  } catch (error) {
    const div = document.createElement("div");
    const button = document.createElement("button");

    div.textContent = error.message;

    div.classList.add(
      "alert",
      "alert-warning",
      "alert-dismissible",
      "fade",
      "show"
    );
    div.setAttribute("role", "alert");

    button.classList.add("btn-close");
    button.setAttribute("type", "button");
    button.setAttribute("arial-label", "close");

    button.addEventListener("click", () => {
      div.remove();
    });

    div.appendChild(button);
    currenciesEl.insertAdjacentElement("afterend", div);
  }
};

const init = async () => {
  // console.log(await fetchExchangeRate());

  const exchangeRateData = await fetchExchangeRate()

  internalExchangeRate = { ...exchangeRateData }

  const getOptions = selectedCurrency => Object.keys(exchangeRateData.conversion_rates)
    .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
    .join('');

    console.log(getOptions)
  

  currencyOneEl.innerHTML = getOptions('USD');
  currencyTwoEl.innerHTML = getOptions('BRL');

  convertedValueEl.textContent = exchangeRateData.conversion_rates.BRL.toFixed(2)

  valuePrecisionEl.textContent = `1 USD = ${exchangeRateData.conversion_rates.BRL} BRL`

};

timesCurrencyEl.addEventListener('input', e => {
  convertedValueEl.textContent = (e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
})

currencyTwoEl.addEventListener('input', e => {
  const currencyTwoValue = internalExchangeRate.conversion_rates[e.target.value]

  convertedValueEl.textContent = (timesCurrencyEl.value * currencyTwoEl).toFixed(2)
})

init();
