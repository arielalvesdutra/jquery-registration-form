const errorFieldOf = function (message) {
  return $("<div></div>", { text: message, class: 'alert alert-danger' })
}

const sucessFieldOf = function (message) {
  return $("<div></div>", { text: message, class: 'alert alert-success' })
}

const RegistrationForm = {

  _section: $("#registration-form"),

  _alerts: $("#registration-form__form__alerts"),
  _success: $("#registration-form__form__success"),

  _name: $("#registration-form__form__name"),
  _email: $("#registration-form__form__email"),
  _cellnumber: $("#registration-form__form__cellnumber"),
  _cpf: $("#registration-form__form__cpf"),
  _birthdate: $("#registration-form__form__birthdate"),

  _address_state: $("#registration-form__form__state"),
  _address_city: $("#registration-form__form__city"),
  _address_district: $("#registration-form__form__district"),
  _address_street: $("#registration-form__form__address"),
  _address_complement: $("#registration-form__form__address_complement"),
  _address_number: $("#registration-form__form__address_number"),
  _address_zipcode: $("#registration-form__form__address_zipcode"),

  _bio_description: $("#registration-form__form__description"),

  init() {
    RegistrationForm._handleFormSubmit()
    RegistrationForm._fillInputMasks()
    RegistrationForm._handleZipcodeChange()
  },

  _clearFormErrors() {
    RegistrationForm._alerts.empty()
  },
  _clearSuccessMessage() {
    RegistrationForm._success.empty()
  },
  _clearAddressFields() {
    RegistrationForm._address_state.val("")
    RegistrationForm._address_city.val("")
    RegistrationForm._address_district.val("")
    RegistrationForm._address_street.val("")
  },

  _fillInputMasks() {
    RegistrationForm._cellnumber.inputmask({
      mask: ['(99) 9999-9999', '(99) 99999-9999'],
      autoUnmask: true,
      placeholder: "0",
      jitMasking: true
    })
    RegistrationForm._cpf.inputmask({
      mask: '999.999.999-99',
      autoUnmask: true,
      placeholder: "0",
      jitMasking: true
    })
    RegistrationForm._address_zipcode.inputmask({
      mask: '99999-999',
      autoUnmask: true,
      placeholder: "0",
      jitMasking: true
    })
  },
  _fillAddressDataAfterFetchingZipcode(data) {
    RegistrationForm._address_state.val(data.estado)
    RegistrationForm._address_city.val(data.cidade)
    RegistrationForm._address_district.val(data.logradouro)
    RegistrationForm._address_street.val(data.bairro)
  },
  _fillFieldErrors(errors) {
    RegistrationForm._alerts.empty()
    for (error of errors) {
      RegistrationForm._alerts.append(errorFieldOf(error))
    }
  },
  _showSuccessMessage() {
    RegistrationForm._success.empty()
    RegistrationForm._success.append(sucessFieldOf("Registro realilizado com sucesso!"))
    RegistrationForm._jumpToSectionTop()
  },

  _isValidZipcodeLength(zipcode) {
    return zipcode.length === 8
  },

  async _fetchZipcode(zipcode) {
    const url = `https://api.postmon.com.br/v1/cep/${zipcode}`
    const response = await axios.get(url)
    return response.data
  },

  _handleFormSubmit() {
    $("#registration-form__form").submit(RegistrationForm._submitForm)
  },
  _handleZipcodeChange() {
    RegistrationForm._address_zipcode
      .keyup(RegistrationForm._updateZipcode)
      .blur(RegistrationForm._updateZipcode)
  },
  _submitForm: async (event) => {
    event.preventDefault()
    try {
      RegistrationForm._validateForm()
      RegistrationForm._showSuccessMessage()
      RegistrationForm._logAllFields()
    } catch (error) { }
  },

  async _updateZipcode(event) {
    const zipcode = event.target.value

    if (RegistrationForm._isValidZipcodeLength(zipcode)) {
      try {

        const zipcodeData = await RegistrationForm._fetchZipcode(zipcode)
        RegistrationForm._fillAddressDataAfterFetchingZipcode(zipcodeData)

      } catch (error) {
        RegistrationForm._clearAddressFields()
        RegistrationForm._fillFieldErrors(["CEP inválido"])
      }
    }
  },

  _validateForm() {
    RegistrationForm._clearSuccessMessage()
    RegistrationForm._clearFormErrors()
    let errors = []

    if (RegistrationForm._name.val() === "") {
      errors.push("Nome é obrigatório")
    }

    if (RegistrationForm._email.val() === "") {
      errors.push("E-mail é obrigatório")
    }

    if (RegistrationForm._cellnumber.val() === "") {
      errors.push("Celular é obrigatório")
    }

    if (RegistrationForm._cellnumber.val() != "" &&
      (RegistrationForm._cellnumber.val().length < 10
        || RegistrationForm._cellnumber.val().length > 12)) {
      errors.push("Celular inválido")
    }

    if (RegistrationForm._cpf.val() === "") {
      errors.push("CPF é obrigatório")
    }

    if (RegistrationForm._cpf.val() != ""
      && RegistrationForm._cpf.val().length != 11) {
      errors.push("CPF inválido")
    }

    if (RegistrationForm._birthdate.val() === "") {
      errors.push("Data de nascimento é obrigatória")
    }

    if (RegistrationForm._birthdate.val() != ""
      && new Date(RegistrationForm._birthdate.val()) > new Date()) {
      errors.push("Data de nascimento invalida")
    }

    if (RegistrationForm._address_zipcode.val() === "") {
      errors.push("CEP é obrigatório")
    }

    if (RegistrationForm._address_zipcode.val() != "" &&
      RegistrationForm._address_zipcode.val().length != 8) {
      errors.push("CEP é inválido")
    }

    if (RegistrationForm._address_street.val() === "") {
      errors.push("Logradouro é obrigatório")
    }

    if (RegistrationForm._address_number.val() === "") {
      errors.push("Número do endereço é obrigatório")
    }

    if (RegistrationForm._address_city.val() === "") {
      errors.push("Cidade é obrigatória")
    }

    if (RegistrationForm._address_state.val() === "") {
      errors.push("Estado é obrigatório")
    }

    if (RegistrationForm._bio_description.val() === "") {
      errors.push("Descrição é obrigatória")
    }

    if (errors.length > 0) {
      RegistrationForm._fillFieldErrors(errors)
      RegistrationForm._jumpToSectionTop()

      throw new Error("Há erros de preenchimento de campos")
    }
  },

  _jumpToSectionTop() {
    $('body, html').animate({ scrollTop: RegistrationForm._section.offset().top }, 600);
  },
  _logAllFields() {
    console.log(
      '_name: ', RegistrationForm._name.val(),
      '\n_email: ', RegistrationForm._email.val(),
      '\n_cellnumber: ', RegistrationForm._cellnumber.val(),
      '\n_cpf: ', RegistrationForm._cpf.val(),
      '\n_birthdate: ', RegistrationForm._birthdate.val(),
      '\n_address_zipcode: ', RegistrationForm._address_zipcode.val(),
      '\n_address_number: ', RegistrationForm._address_number.val(),
      '\n_address_street: ', RegistrationForm._address_street.val(),
      '\n_address_city: ', RegistrationForm._address_city.val(),
      '\n_address_state: ', RegistrationForm._address_state.val(),
      '\n_address_complement: ', RegistrationForm._address_complement.val(),
      '\n_bio_description: ', RegistrationForm._bio_description.val()
    )
  }
}

RegistrationForm.init()


