// SPDX-License-Identifier: Apache-2.0
// O objeto Recorte, do lado do EDITOR do Construct (a janela onde se monta o
// layout). A forma é a do exemplo oficial "drawingPlugin" do Addon SDK v2, na
// versão que pedia r401 (github.com/Scirra/Construct-Addon-SDK, commit 91c5298).
//
// *** NUNCA MUDE O ID. *** Mudar o id faz o Construct achar que é outro objeto
// e quebra todo projeto que já usa este. Para mudar o nome que aparece, mude o
// "name" do lang/en-US.json, nunca o id.

const SDK = globalThis.SDK;

const PLUGIN_ID = "Recorte_Leitor";
const PLUGIN_CATEGORY = "general";

const PLUGIN_CLASS = SDK.Plugins.Recorte_Leitor = class RecortePlugin extends SDK.IPluginBase
{
	constructor()
	{
		super(PLUGIN_ID);

		SDK.Lang.PushContext("plugins." + PLUGIN_ID.toLowerCase());

		this._info.SetName(globalThis.lang(".name"));
		this._info.SetDescription(globalThis.lang(".description"));
		this._info.SetCategory(PLUGIN_CATEGORY);
		this._info.SetAuthor("Recorte");
		this._info.SetHelpUrl(globalThis.lang(".help-url"));
		this._info.SetPluginType("world");		// objeto que aparece e desenha
		this._info.SetIsResizable(false);		// o tamanho vem do boneco e da propriedade Escala
		this._info.SetIsRotatable(true);
		this._info.SetHasImage(false);			// as imagens vêm do atlas, da pasta Files
		this._info.SetSupportsEffects(true);
		this._info.SetMustPreDraw(true);
		this._info.AddCommonPositionACEs();
		this._info.AddCommonAngleACEs();
		this._info.AddCommonAppearanceACEs();
		this._info.AddCommonZOrderACEs();
		this._info.SetRuntimeModuleMainScript("c3runtime/main.js");

		// O nosso runtime inteiro, num script comum que deixa tudo em
		// globalThis.RecorteRuntime. É como o plugin do Spine carrega o dele.
		// O mesmo arquivo está em "editor-scripts" (addon.json): o editor de
		// layout usa a mesma conta para desenhar o boneco parado.
		this._info.AddFileDependency({
			filename: "c3runtime/recorte-runtime.js",
			type: "external-runtime-script"
		});

		SDK.Lang.PushContext(".properties");

		// A ORDEM destas propriedades é a ordem em que o c3runtime/instance.js
		// as lê. Mudou aqui, muda lá.
		this._info.SetProperties([
			new SDK.PluginProperty("text", "arquivo", "heroi.bone"),
			new SDK.PluginProperty("text", "animacao", ""),
			new SDK.PluginProperty("check", "em-laco", true),
			new SDK.PluginProperty("float", "escala", 1),
			new SDK.PluginProperty("text", "skins", "")
		]);

		SDK.Lang.PopContext();	// .properties

		SDK.Lang.PopContext();
	}
};

PLUGIN_CLASS.Register(PLUGIN_ID, PLUGIN_CLASS);
