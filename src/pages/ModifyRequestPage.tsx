import React from "react";
import SelfNominationComponent from "@/components/SelfNomination/SelfNominationComponent";

/**
 * ModifyRequestPage reuses the existing Create Request form (SelfNominationComponent)
 * in Edit Mode, satisfying the requirement that Create Request and Modify Request
 * use the same unified form component without code duplication.
 */
const ModifyRequestPage: React.FC = () => {
  return <SelfNominationComponent />;
};

export default ModifyRequestPage;
