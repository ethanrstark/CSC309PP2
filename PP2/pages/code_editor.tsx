import React, { useState, useEffect } from "react";
import SaveEditTemplate from "@/components/SaveTemplateButton";

const CodeEditorPage = () => {
  const [code, setCode] = useState("print more stuff and some more"); // Your code editor state
  const [templateId, setTemplateId] = useState<number | null>(null); // Template ID for editing
    const [forkedId, setforkedId] = useState<number|null>(1)


  // Callback to update templateId when a new template is saved
  const handleTemplateSaved = (newTemplateId: number) => {
    setTemplateId(newTemplateId); // Update the templateId state
    console.log(templateId)
  };

  return (
    <div>
      {/* Your code editor UI */}
      <SaveEditTemplate
        code={code}
        forkedTemplateId={forkedId}
        editTemplateId={templateId}
        newlySavedTemplate={handleTemplateSaved} // Pass the callback here
      />
    </div>
  );
};

export default CodeEditorPage;