import Vue from "vue";
import "muse-ui/lib/styles/base.less";
import Toast from "muse-ui-toast";
import {
  AppBar,
  Button,
  theme,
  Tabs,
  TextField,
  Chip,
  Divider,
  DataTable,
  Dialog,
  Paper,
  Snackbar,
  Grid,
  Icon,
  Stepper,
  SubHeader
} from "muse-ui";
import "muse-ui/lib/styles/theme.less";
import * as colors from "muse-ui/lib/theme/colors";
Vue.use(Toast);
Vue.use(Tabs);
Vue.use(Dialog);
Vue.use(Snackbar);
Vue.use(AppBar);
Vue.use(Chip);
Vue.use(Button);
Vue.use(TextField);
Vue.use(Paper);
Vue.use(Divider);
Vue.use(DataTable);
Vue.use(Grid);
Vue.use(Icon);
Vue.use(Stepper);
Vue.use(SubHeader);
theme.add("custom-theme", {
  primary: colors.indigo,
  secondary: colors.pinkA200
});
