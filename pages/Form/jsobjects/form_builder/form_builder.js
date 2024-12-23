export default {
	defaultTab: 'Forms',

	setDefaultTab: (newTab) => {
		this.defaultTab = newTab;
	},
	
	saveForm: async (id, name, status, json) => {
    try {
        if (id) {
            // Update existing form if id exists
            await updateForm.run({
                id: id,
                name: name,
                status: status,
                json: json,
            });
            showAlert("Form updated successfully!", "success");
        } else {
            // Create new form if id is null
            await createForm.run({
                name: name,
                status: status,
                json: json,
            });
            showAlert("Form created successfully!", "success");
        }
    } catch (error) {
        // Handle specific errors, such as duplicate title
        if (error.message.includes("Duplicate entry")) {
            showAlert("An application form with this title already exists.", "error");
        } else {
            // Generic error message for unexpected errors
            showAlert("An error occurred while saving the form. Please try again.", "error");
        }
    }
	},

	openForm: () => {
		// Change to the Form Builder tab
		this.setDefaultTab("Form_Builder");
	},
	
	newForm: () => {
		formTable.setSelectedRowIndex(-1);
		this.setDefaultTab("Form_Builder");
	}
}