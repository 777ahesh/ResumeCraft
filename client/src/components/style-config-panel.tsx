import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Palette, 
  Type, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  RefreshCw,
  Eye
} from "lucide-react";
import { useState } from "react";
import type { StyleConfig, FieldStyle } from "@/types/resume";
import { useIsMobile } from "@/hooks/use-mobile";

interface StyleConfigPanelProps {
  styleConfig: StyleConfig;
  onChange: (config: StyleConfig) => void;
  selectedField?: string | null;
  fieldStyles?: Record<string, FieldStyle>;
  onFieldStyleChange?: (fieldId: string, styles: FieldStyle) => void;
}

const defaultStyleConfig: StyleConfig = {
  fontFamily: 'Inter',
  fontSize: 14,
  primaryColor: '#3B82F6',
  secondaryColor: '#6B7280',
  textColor: '#1F2937',
  backgroundColor: '#FFFFFF',
  headerStyle: 'bold',
  spacing: 'normal',
  borderRadius: 4,
  lineHeight: 1.5,
};

const fontFamilies = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Georgia', label: 'Georgia (Serif)' },
  { value: 'Arial', label: 'Arial (Sans-serif)' },
  { value: 'Times New Roman', label: 'Times (Classic)' },
  { value: 'Helvetica', label: 'Helvetica (Clean)' },
  { value: 'Roboto', label: 'Roboto (Google)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Montserrat', label: 'Montserrat (Modern)' },
  { value: 'Lato', label: 'Lato (Professional)' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Tech)' },
];

const colorPresets = [
  { name: 'Professional Blue', primary: '#3B82F6', secondary: '#6B7280' },
  { name: 'Corporate Navy', primary: '#1E293B', secondary: '#64748B' },
  { name: 'Creative Teal', primary: '#0F766E', secondary: '#6B7280' },
  { name: 'Modern Purple', primary: '#7C3AED', secondary: '#A78BFA' },
  { name: 'Elegant Green', primary: '#059669', secondary: '#6B7280' },
  { name: 'Bold Orange', primary: '#EA580C', secondary: '#F97316' },
  { name: 'Classic Black', primary: '#000000', secondary: '#4B5563' },
  { name: 'Warm Red', primary: '#DC2626', secondary: '#EF4444' },
];

export function StyleConfigPanel({ 
  styleConfig, 
  onChange, 
  selectedField, 
  fieldStyles = {}, 
  onFieldStyleChange 
}: StyleConfigPanelProps) {
  const isMobile = useIsMobile();
  const [openSections, setOpenSections] = useState({
    fieldSpecific: selectedField !== null,
    typography: !selectedField || !isMobile,
    colors: !isMobile,
    layout: !isMobile,
    presets: !isMobile,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateStyle = (field: keyof StyleConfig, value: any) => {
    onChange({
      ...styleConfig,
      [field]: value,
    });
  };

  const updateFieldStyle = (field: keyof FieldStyle, value: any) => {
    if (!selectedField || !onFieldStyleChange) return;
    
    const currentFieldStyles = fieldStyles[selectedField] || {};
    const newFieldStyles = {
      ...currentFieldStyles,
      [field]: value,
    };
    onFieldStyleChange(selectedField, newFieldStyles);
  };

  const getCurrentFieldStyle = (field: keyof FieldStyle): any => {
    if (!selectedField) return undefined;
    return fieldStyles[selectedField]?.[field];
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    onChange({
      ...styleConfig,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    });
  };

  const resetToDefaults = () => {
    onChange(defaultStyleConfig);
  };

  return (
    <div className={`bg-white ${!isMobile ? 'border-r border-gray-200' : ''} ${isMobile ? 'w-full h-full' : 'w-80'} overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 flex items-center`}>
          <Settings className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          Style Configuration
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="text-xs"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Field-Specific Styling Section */}
      {selectedField && (
        <Collapsible open={openSections.fieldSpecific} onOpenChange={() => toggleSection('fieldSpecific')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center">
                {openSections.fieldSpecific ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                <Eye className="h-4 w-4 mr-2" />
                <span className="font-medium">Selected Field Styles</span>
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 space-y-4">
                <div className="text-xs text-blue-600 font-medium mb-2">
                  Styling: {selectedField.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                
                {/* Field Font Size */}
                <div className="space-y-2">
                  <Label htmlFor="fieldFontSize">Font Size: {getCurrentFieldStyle('fontSize') || 'inherit'}px</Label>
                  <Slider
                    value={[Number(getCurrentFieldStyle('fontSize')) || styleConfig.fontSize]}
                    onValueChange={(value) => updateFieldStyle('fontSize', value[0])}
                    max={32}
                    min={8}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Field Font Family */}
                <div className="space-y-2">
                  <Label htmlFor="fieldFontFamily">Font Family</Label>
                  <Select 
                    value={String(getCurrentFieldStyle('fontFamily') || styleConfig.fontFamily)} 
                    onValueChange={(value) => updateFieldStyle('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Color */}
                <div className="space-y-2">
                  <Label htmlFor="fieldColor">Text Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={String(getCurrentFieldStyle('color') || styleConfig.textColor)}
                      onChange={(e) => updateFieldStyle('color', e.target.value)}
                      className="w-12 h-8 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={String(getCurrentFieldStyle('color') || styleConfig.textColor)}
                      onChange={(e) => updateFieldStyle('color', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Field Font Weight */}
                <div className="space-y-2">
                  <Label htmlFor="fieldFontWeight">Font Weight</Label>
                  <Select 
                    value={String(getCurrentFieldStyle('fontWeight') || 'normal')} 
                    onValueChange={(value) => updateFieldStyle('fontWeight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Lighter</SelectItem>
                      <SelectItem value="bolder">Bolder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Font Style */}
                <div className="space-y-2">
                  <Label htmlFor="fieldFontStyle">Font Style</Label>
                  <Select 
                    value={String(getCurrentFieldStyle('fontStyle') || 'normal')} 
                    onValueChange={(value) => updateFieldStyle('fontStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="italic">Italic</SelectItem>
                      <SelectItem value="oblique">Oblique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Text Align */}
                <div className="space-y-2">
                  <Label htmlFor="fieldTextAlign">Text Alignment</Label>
                  <Select 
                    value={String(getCurrentFieldStyle('textAlign') || 'left')} 
                    onValueChange={(value) => updateFieldStyle('textAlign', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select text alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Field Line Height */}
                <div className="space-y-2">
                  <Label htmlFor="fieldLineHeight">Line Height: {getCurrentFieldStyle('lineHeight') || styleConfig.lineHeight}</Label>
                  <Slider
                    value={[Number(getCurrentFieldStyle('lineHeight')) || styleConfig.lineHeight]}
                    onValueChange={(value) => updateFieldStyle('lineHeight', value[0])}
                    max={3}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Typography Section */}
      <Collapsible open={openSections.typography} onOpenChange={() => toggleSection('typography')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center">
              {openSections.typography ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              <Type className="h-4 w-4 mr-2" />
              <span className="font-medium">Typography</span>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Font Family */}
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={styleConfig.fontFamily} onValueChange={(value) => updateStyle('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size: {styleConfig.fontSize}px</Label>
                <Slider
                  value={[styleConfig.fontSize]}
                  onValueChange={(value) => updateStyle('fontSize', value[0])}
                  max={20}
                  min={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Header Style */}
              <div className="space-y-2">
                <Label htmlFor="headerStyle">Header Style</Label>
                <Select value={styleConfig.headerStyle} onValueChange={(value) => updateStyle('headerStyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select header style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="italic">Italic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Line Height */}
              <div className="space-y-2">
                <Label htmlFor="lineHeight">Line Height: {styleConfig.lineHeight}</Label>
                <Slider
                  value={[styleConfig.lineHeight]}
                  onValueChange={(value) => updateStyle('lineHeight', value[0])}
                  max={2.5}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Colors Section */}
      <Collapsible open={openSections.colors} onOpenChange={() => toggleSection('colors')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center">
              {openSections.colors ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              <Palette className="h-4 w-4 mr-2" />
              <span className="font-medium">Colors</span>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: styleConfig.primaryColor }}
                  />
                  <Input
                    type="color"
                    value={styleConfig.primaryColor}
                    onChange={(e) => updateStyle('primaryColor', e.target.value)}
                    className="w-16 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={styleConfig.primaryColor}
                    onChange={(e) => updateStyle('primaryColor', e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: styleConfig.secondaryColor }}
                  />
                  <Input
                    type="color"
                    value={styleConfig.secondaryColor}
                    onChange={(e) => updateStyle('secondaryColor', e.target.value)}
                    className="w-16 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={styleConfig.secondaryColor}
                    onChange={(e) => updateStyle('secondaryColor', e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#6B7280"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: styleConfig.textColor }}
                  />
                  <Input
                    type="color"
                    value={styleConfig.textColor}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    className="w-16 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={styleConfig.textColor}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#1F2937"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: styleConfig.backgroundColor }}
                  />
                  <Input
                    type="color"
                    value={styleConfig.backgroundColor}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-16 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={styleConfig.backgroundColor}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Layout Section */}
      <Collapsible open={openSections.layout} onOpenChange={() => toggleSection('layout')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center">
              {openSections.layout ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              <Settings className="h-4 w-4 mr-2" />
              <span className="font-medium">Layout</span>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Spacing */}
              <div className="space-y-2">
                <Label htmlFor="spacing">Spacing</Label>
                <Select value={styleConfig.spacing} onValueChange={(value) => updateStyle('spacing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select spacing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tight">Tight</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius: {styleConfig.borderRadius}px</Label>
                <Slider
                  value={[styleConfig.borderRadius]}
                  onValueChange={(value) => updateStyle('borderRadius', value[0])}
                  max={20}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Color Presets Section */}
      <Collapsible open={openSections.presets} onOpenChange={() => toggleSection('presets')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center">
              {openSections.presets ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              <Eye className="h-4 w-4 mr-2" />
              <span className="font-medium">Color Presets</span>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-3">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {colorPresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <span className="text-sm">{preset.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
