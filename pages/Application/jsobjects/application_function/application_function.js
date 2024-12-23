export default {
	defaultTab: 'Applications',

	setDefaultTab: (newTab) => {
		this.defaultTab = newTab;
	},

	openApplication: () => {
		formsTable.setSelectedRowIndex(-1);
		this.setDefaultTab("Application_Editor");
	},
	
	startApplication: () => {
		applicationsTable.setSelectedRowIndex(-1);
		this.setDefaultTab("Application_Creator");
	},
	
	newApplication: () => {
		formsTable.setSelectedRowIndex(-1);
		formsTable.setSelectedRowIndex(-1);
		this.setDefaultTab("Forms");
	}
}