'use client';

import { HStack, Stack } from '@chakra-ui/react';

import { SelectField } from '@/components/form/SelectField';
import { SwitchField } from '@/components/form/SwitchField';
import { TextField } from '@/components/form/TextField';
import { StatusMessage } from '@/components/tool/StatusMessage';
import { ToolPanels } from '@/components/tool/ToolPanels';

import { EncodingWarning } from './components/EncodingWarning';
import { FormSection } from './components/FormSection';
import { HostList } from './components/HostList';
import { ParamsEditor } from './components/ParamsEditor';
import { UriPreview } from './components/UriPreview';
import { DATABASE_FIELD_ID } from './lib/validateConnectionForm';
import {
  engineOptions,
  useConnectionStringScreen,
} from './useConnectionStringScreen';

export function ConnectionStringScreen() {
  const {
    form,
    engine,
    resolved,
    fieldErrors,
    warnings,
    isValid,
    uri,
    previewUri,
    encodings,
    hasPassword,
    isPasswordVisible,
    droppedParams,
    availableSuggestions,
    textFieldHandlers,
    handleEngineChange,
    handleVariantChange,
    handleHostChange,
    handleAddHost,
    handleRemoveHost,
    handleAddSuggestedParam,
    handleAddCustomParam,
    handleParamChange,
    handleRemoveParam,
    handleTogglePassword,
  } = useConnectionStringScreen();

  const usesInstanceWithoutPort =
    engine.supportsInstance && form.instance !== '';
  const portPlaceholder = usesInstanceWithoutPort
    ? 'Optional'
    : String(resolved.defaultPort ?? '');

  return (
    <Stack gap="6">
      <StatusMessage tone="info" title="Your credentials stay on this device">
        Everything is processed in your browser. Nothing is stored or sent
        anywhere.
      </StatusMessage>

      <ToolPanels>
        <Stack gap="5">
          <FormSection legend="Engine">
            <HStack gap="6" align="flex-end" wrap="wrap">
              <SelectField
                label="Database engine"
                value={form.engineId}
                options={engineOptions}
                onChange={handleEngineChange}
                width="52"
              />
              {engine.variant && (
                <SwitchField
                  label={engine.variant.label}
                  checked={form.variantEnabled}
                  onChange={handleVariantChange}
                />
              )}
            </HStack>
            {droppedParams.length > 0 && (
              <StatusMessage tone="info" title="Parameters removed">
                {`Not supported by ${engine.label}: ${droppedParams.join(', ')}.`}
              </StatusMessage>
            )}
          </FormSection>

          <FormSection legend={resolved.allowsMultipleHosts ? 'Hosts' : 'Host'}>
            <HostList
              hosts={form.hosts}
              resolved={resolved}
              fieldErrors={fieldErrors}
              portPlaceholder={portPlaceholder}
              onChange={handleHostChange}
              onAdd={handleAddHost}
              onRemove={handleRemoveHost}
            />
          </FormSection>

          <FormSection legend="Credentials">
            {engine.credentials === 'none' ? (
              <StatusMessage tone="info" title="No credentials in this URI">
                {engine.notice}
              </StatusMessage>
            ) : (
              <HStack align="flex-start" gap="3" wrap="wrap">
                <TextField
                  label="Username"
                  value={form.username}
                  onChange={textFieldHandlers.username}
                  helperText={
                    engine.credentials === 'password-only-allowed'
                      ? 'Leave empty to authenticate with a password only.'
                      : undefined
                  }
                  flex="1"
                />
                <TextField
                  label="Password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={form.password}
                  onChange={textFieldHandlers.password}
                  autoComplete="new-password"
                  flex="1"
                />
              </HStack>
            )}
          </FormSection>

          <FormSection legend={engine.database.label}>
            <HStack align="flex-start" gap="3" wrap="wrap">
              <TextField
                label={engine.database.label}
                value={form.database}
                onChange={textFieldHandlers.database}
                error={fieldErrors[DATABASE_FIELD_ID]}
                helperText={engine.database.helperText}
                inputMode={engine.database.numeric ? 'numeric' : undefined}
                flex="1"
              />
              {engine.supportsInstance && (
                <TextField
                  label="Instance name"
                  value={form.instance}
                  onChange={textFieldHandlers.instance}
                  helperText="The port is omitted unless you type one."
                  flex="1"
                />
              )}
            </HStack>
          </FormSection>

          <FormSection legend="Query parameters">
            <ParamsEditor
              params={form.params}
              suggestedParams={engine.suggestedParams}
              availableSuggestions={availableSuggestions}
              onAddSuggested={handleAddSuggestedParam}
              onAddCustom={handleAddCustomParam}
              onChange={handleParamChange}
              onRemove={handleRemoveParam}
            />
          </FormSection>
        </Stack>

        <Stack
          gap="4"
          alignSelf="flex-start"
          position={{ lg: 'sticky' }}
          top={{ lg: '24' }}
        >
          <UriPreview
            uri={uri}
            previewUri={previewUri}
            isValid={isValid}
            hasPassword={hasPassword}
            isPasswordVisible={isPasswordVisible}
            onTogglePassword={handleTogglePassword}
          />
          <EncodingWarning encodings={encodings} />
          {warnings.map((warning) => (
            <StatusMessage key={warning} tone="warning" title="Duplicate key">
              {warning}
            </StatusMessage>
          ))}
        </Stack>
      </ToolPanels>
    </Stack>
  );
}
