# Comprehensive Validation Strategy

This document outlines our approach to form validation in the application, covering both frontend and backend validation strategies.

## Frontend Validation

### Real-time Validation

We implement real-time validation to provide immediate feedback to users as they interact with forms. This is achieved using a combination of the `useValidation` hook and validator functions.

#### Validation Hooks

The `useValidation` hook provides real-time validation with support for:

- Field-level validation
- Form-level validation
- Marking fields as touched on blur
- Validation on change
- Validation on blur
- Validation on submit

#### Validation Timing

We use different validation strategies depending on the field type and user expectations:

1. **On Change (while typing)**: 
   - For immediate feedback (e.g., password strength, character count)
   - Applied after a debounce period to avoid validating on every keystroke

2. **On Blur (when field loses focus)**:
   - For most validations
   - Shows errors only after the user has finished interacting with a field

3. **On Submit**:
   - Final validation before form submission
   - Shows all validation errors at once

### Validator Functions

We provide standard validator functions for common validation scenarios:

- `required`: Validates that a field is not empty
- `minLength`: Validates minimum text length
- `maxLength`: Validates maximum text length
- `email`: Validates email format
- `ruc`: Validates Ecuadorian RUC format
- `phone`: Validates phone number format
- `number`: Validates that a value is a valid number
- `range`: Validates that a number is within a specific range
- `min`: Validates that a number meets a minimum value
- `max`: Validates that a number does not exceed a maximum value

These can be composed to create complex validation rules:

```javascript
const validationSchema = {
  email: validators.compose([
    validators.required("El correo electrónico es obligatorio"),
    validators.email("El formato del correo electrónico es inválido")
  ]),
  password: validators.compose([
    validators.required("La contraseña es obligatoria"),
    validators.minLength(8, "La contraseña debe tener al menos 8 caracteres")
  ])
};
```

### UX Best Practices

1. **Consistent Visual Feedback**:
   - Red border and text for errors
   - Error messages appear below the field
   - Error icons provide visual reinforcement

2. **Clear Error Messages**:
   - Specific feedback about what's wrong
   - Guidance on how to fix the issue
   - Positive tone (avoid accusatory language)

3. **Progressive Disclosure**:
   - Don't show all errors at once on initial render
   - Reveal errors as users interact with fields
   - Summary of errors only shown after submission attempt

4. **Accessibility**:
   - ARIA attributes for screen readers
   - Color is not the only indicator of errors
   - Keyboard navigation support

## Backend Validation

While frontend validation improves user experience, backend validation is essential for security and data integrity. We implement a multi-layered approach:

### Django Model Validation

- Field-level validators in model definitions
- Custom clean methods for model-level validation
- Database constraints (unique, nullability, etc.)

```python
class Cliente(models.Model):
    ruc = models.CharField(max_length=13, validators=[validate_ruc])
    email = models.EmailField(validators=[validate_email])
    
    def clean(self):
        # Custom model-level validation
        if self.tipo_cliente == 'empresa' and not self.razon_social:
            raise ValidationError({'razon_social': 'Razón social es requerida para empresas'})
```

### Django Rest Framework Serializer Validation

- Field-level validation in serializer fields
- Custom validate methods for serializer-level validation
- Nested serializer validation

```python
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
    
    def validate_ruc(self, value):
        # Custom RUC validation
        if not re.match(r'^\d{13}$', value):
            raise serializers.ValidationError("RUC debe tener 13 dígitos")
        return value
    
    def validate(self, data):
        # Cross-field validation
        if data.get('tipo_cliente') == 'empresa' and not data.get('razon_social'):
            raise serializers.ValidationError({"razon_social": "Razón social es requerida para empresas"})
        return data
```

### Handling Validation Errors

1. **Return Structured Error Responses**:
   ```python
   {
     "status": 400,
     "message": "Datos inválidos. Por favor, verifique la información.",
     "errors": {
       "ruc": ["RUC debe tener 13 dígitos"],
       "email": ["Ingrese un correo electrónico válido"]
     }
   }
   ```

2. **Map Backend Errors to Frontend Fields**:
   ```javascript
   catch (error) {
     // If the server returns field-specific errors, update the form errors
     if (error.errors && typeof error.errors === 'object') {
       Object.entries(error.errors).forEach(([field, message]) => {
         setFieldError(field, message);
         setFieldTouched(field, true);
       });
     }
   }
   ```

## Security Considerations

### Input Sanitization

- Sanitize user input on both frontend and backend
- Prevent XSS attacks by escaping HTML special characters
- Use Django's built-in protection against CSRF attacks

### Rate Limiting

- Implement rate limiting for form submissions
- Prevent brute force attacks on sensitive forms

### Data Validation vs. Business Rules

Distinguish between:

1. **Data Validation**: Ensuring data conforms to expected formats (RUC is 13 digits)
2. **Business Rules**: Enforcing business logic (customer must have a valid contract)

## Implementation Checklist

### Frontend

- [ ] Use the `useValidation` hook for form validation
- [ ] Implement real-time validation with appropriate timing
- [ ] Show clear error messages with visual indicators
- [ ] Handle backend validation errors gracefully
- [ ] Disable form submission until all validation passes
- [ ] Show summary of errors after submission attempt

### Backend

- [ ] Implement model-level validation
- [ ] Implement serializer-level validation
- [ ] Return structured error responses
- [ ] Sanitize all user input
- [ ] Implement appropriate security measures
- [ ] Log validation failures for security monitoring

## Example Implementation

See the following files for example implementations:

- `/src/lib/hooks/useValidation.js`: Validation hook implementation
- `/src/lib/utils/validation.js`: Standard validator functions
- `/src/pages/proformas/components/ClientFormWithValidation.jsx`: Example form with validation