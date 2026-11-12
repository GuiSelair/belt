'use client';

import { useCallback, useMemo, useState } from 'react';

import { buildConnectionUri } from './lib/buildConnectionUri';
import { createConnectionForm } from './lib/createConnectionForm';
import { engines, getEngine } from './lib/engines';
import { resolveEngine } from './lib/resolveEngine';
import { switchEngine } from './lib/switchEngine';
import type {
  ConnectionForm,
  EngineId,
  HostEntry,
  ParamEntry,
} from './lib/types';
import { validateConnectionForm } from './lib/validateConnectionForm';

type TextFieldName = 'username' | 'password' | 'database' | 'instance';

export const engineOptions = engines.map(({ id, label }) => ({
  value: id,
  label,
}));

function createId() {
  return crypto.randomUUID();
}

export function useConnectionStringScreen() {
  const [form, setForm] = useState(() =>
    createConnectionForm('postgresql', createId),
  );
  const [droppedParams, setDroppedParams] = useState<string[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const engine = getEngine(form.engineId);
  const resolved = resolveEngine(engine, form.variantEnabled);
  const validation = useMemo(() => validateConnectionForm(form), [form]);
  const build = useMemo(() => buildConnectionUri(form), [form]);

  const availableSuggestions = useMemo(() => {
    const usedKeys = new Set(form.params.map(({ key }) => key));
    return engine.suggestedParams.filter(({ key }) => !usedKeys.has(key));
  }, [engine, form.params]);

  const updateForm = useCallback((patch: Partial<ConnectionForm>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const updateTextField = useCallback(
    (field: TextFieldName) => (value: string) => updateForm({ [field]: value }),
    [updateForm],
  );
  const textFieldHandlers = useMemo(
    () => ({
      username: updateTextField('username'),
      password: updateTextField('password'),
      database: updateTextField('database'),
      instance: updateTextField('instance'),
    }),
    [updateTextField],
  );

  const handleEngineChange = useCallback(
    (engineId: EngineId) => {
      const result = switchEngine(form, engineId);
      setForm(result.form);
      setDroppedParams(result.droppedParams);
    },
    [form],
  );

  const handleVariantChange = useCallback(
    (variantEnabled: boolean) => updateForm({ variantEnabled }),
    [updateForm],
  );

  const handleHostChange = useCallback(
    (id: string, patch: Partial<Omit<HostEntry, 'id'>>) => {
      setForm((current) => ({
        ...current,
        hosts: current.hosts.map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        ),
      }));
    },
    [],
  );

  const handleAddHost = useCallback(() => {
    setForm((current) => ({
      ...current,
      hosts: [...current.hosts, { id: createId(), host: '', port: '' }],
    }));
  }, []);

  const handleRemoveHost = useCallback((id: string) => {
    setForm((current) => ({
      ...current,
      hosts: current.hosts.filter((entry) => entry.id !== id),
    }));
  }, []);

  const handleAddSuggestedParam = useCallback(
    (key: string) => {
      const suggestion = engine.suggestedParams.find(
        (candidate) => candidate.key === key,
      );
      const param: ParamEntry = {
        id: createId(),
        key,
        value: suggestion?.values?.[0] ?? '',
        origin: 'suggested',
      };
      setForm((current) => ({
        ...current,
        params: [...current.params, param],
      }));
    },
    [engine],
  );

  const handleAddCustomParam = useCallback(() => {
    const param: ParamEntry = {
      id: createId(),
      key: '',
      value: '',
      origin: 'custom',
    };
    setForm((current) => ({ ...current, params: [...current.params, param] }));
  }, []);

  const handleParamChange = useCallback(
    (id: string, patch: Partial<Pick<ParamEntry, 'key' | 'value'>>) => {
      setForm((current) => ({
        ...current,
        params: current.params.map((param) =>
          param.id === id ? { ...param, ...patch } : param,
        ),
      }));
    },
    [],
  );

  const handleRemoveParam = useCallback((id: string) => {
    setForm((current) => ({
      ...current,
      params: current.params.filter((param) => param.id !== id),
    }));
  }, []);

  const handleTogglePassword = useCallback(() => {
    setIsPasswordVisible((visible) => !visible);
  }, []);

  return {
    form,
    engine,
    resolved,
    fieldErrors: validation.fieldErrors,
    warnings: validation.warnings,
    isValid: validation.isValid,
    uri: build.uri,
    previewUri: isPasswordVisible ? build.uri : build.maskedUri,
    encodings: build.encodings,
    hasPassword: form.password !== '' && engine.credentials !== 'none',
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
  };
}
