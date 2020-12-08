module.exports = class {
  /**
   * console.log of instance of Sequelize instance or array of instance
   * @param instance {object}
   * @param title {string | undefined}
   */
  static logOfInstance(instance, title = undefined) {
    if (typeof instance !== "object") {
      console.log("Type Error : ", instance);
      return;
    }

    console.log(
      "===============",
      title || "log Of instance",
      "==============="
    );
    try {
      if (Array.isArray(instance)) {
        console.log(instance.map(i => i.toJSON()));
      } else {
        console.log(instance.toJSON());
      }
    } catch (e) {
      console.log(instance);
    }

    console.log(
      "===============",
      title || "log Of instance",
      " end ==============="
    );
  }
};
