// SPDX-License-Identifier: Apache-2.0
const SDK = globalThis.SDK;

const PLUGIN_CLASS = SDK.Plugins.Recorte_Leitor;

PLUGIN_CLASS.Type = class RecorteType extends SDK.ITypeBase
{
	constructor(sdkPlugin, iObjectType)
	{
		super(sdkPlugin, iObjectType);
	}
};
