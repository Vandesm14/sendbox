const fs = require('fs');

class Database {
	constructor(file) {
		var self = this;
		this.file = file;
		this.records = {};
		this.open = () => {
			fs.exists(this.file, function(exists) {
				if (!exists) {
					fs.writeFile(file, '', 'utf8', () => {
						self.recordss = {};
						return {};
					});
				} else {
					fs.readFile(file, 'utf8', (data) => {
						self.recordss = JSON.parse(data);
						return JSON.parse(data);
					});
				}
			});
		};
		this.write = (path, data) => {
			path = path.split('/');
			let last = path.pop();
			let curr = self.records;
			for (let i of path) {
				if (curr[i]) {
					curr[i] = {};
					curr = curr[i];
				}
			}
			curr[last] = data;
			fs.writeFileSync(this.file, JSON.stringify(self.records), 'utf8', (data) => {
				return data;
			});
		};
		this.read = async (path) => {
			let curr = self.records;
			if (!['', '/', undefined].includes(path)) {
				path = path.split('/');
				if (path !== ['']) {
					for (let i of path) {
						if (curr[i]) {
							curr = curr[i];
						} else {
							return undefined;
						}
					}
				}
			}
			return curr;
		};
	}
}

module.exports = Database;