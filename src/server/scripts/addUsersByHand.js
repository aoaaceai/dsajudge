"use strict";

require("./common");

var _user = _interopRequireDefault(require("/home/DSA-2023/dsajudge/dist/model/user"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _prompt = _interopRequireDefault(require("prompt"));

var _randomstring = _interopRequireDefault(require("randomstring"));

var _bluebird = require("bluebird");

var _argparse = require("argparse");

var _xlsx = _interopRequireDefault(require("xlsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parser = new _argparse.ArgumentParser({
  description: 'Add a new user, and send password mail',
  addHelp: true
});
parser.addArgument(['file'], {
  help: 'The xlsx file'
});

const main = async () => {
//  const args = parser.parseArgs();

  _prompt.default.start();

  const result = await (0, _bluebird.promisify)(_prompt.default.get)({
    properties: {
      account: {
        description: `Your NTU account, don't input @ntu.edu.tw\n (The mail would be send by your account)`,
        pattern: /^\w+$/,
        message: 'Input a valid NTU account',
        required: true
      },
      password: {
        hidden: true
      },
      user_id: {
	required: true
      },
      user_name: {
	required: true
      },
      user_email: {
	required: true
      },
      user_role: {
	description: `"TA" or "admin" or "student"`
      }
    }
  });
  const smtpConfig = {
    host: 'smtps.ntu.edu.tw',
    port: 465,
    secure: true,
    auth: {
      user: result.account,
      pass: result.password
    }
  };

  const mailTransporter = _nodemailer.default.createTransport(smtpConfig);

//  const wb = _xlsx.default.readFile(args.file);

//  const sheet = wb.Sheets[wb.SheetNames[0]];

//  const rows = _xlsx.default.utils.sheet_to_csv(sheet).split('\n').slice(1); // Choose the correct columns according to input xls file
  // const ID=3, NAME = 4, EMAIL = 5;


  const ID = 4,
        NAME = 2,
        EMAIL = 1,
        ROLE = 3;

  /*for (let r of rows) {
    if (!r || !r.length) break;
    const td = r.split(',');
    const user = {
      email: td[EMAIL],
      id: td[ID] || '',
      name: td[NAME],
      roles: [td[ROLE]]
    };*/
    
    const td=[0,result.user_email, result.user_name, result.user_role, result.user_id];
    console.log(td[EMAIL], td[ID], td[NAME], td[ROLE]);
    await newUser(td[EMAIL], td[ID], td[NAME], td[ROLE], mailTransporter);
  //}

  console.log('Ended...');
  process.exit(0);
};

const newUser = async (email, id, name, role, transporter) => {
  const randPass = _randomstring.default.generate(10);

  const hashed = await (0, _bluebird.promisify)(_bcrypt.default.hash)(randPass, 10); // const roles = ['student'];

  let user = await _user.default.findOne({
    email: email
  });

  if (!user) {
    user = new _user.default({
      email: email,
      password: hashed,
      roles: [role],
      meta: {
        id,
        name
      }
    });
  } else {
    user.password = hashed;
    user.roles = [role];
    user.meta.id = id;
    user.meta.name = name;
  }

  const text = `Welcome to DSA2023, this email is to inform you that your DSA Judge account has been created.
Here is your account and temporary password. (You can change your password after logging in.)

- Account: ${email}
- Password: ${randPass}

Head on to https://dsa2023.csie.org/ and try it!
`;
  const mailOptions = {
    from: '"dsa2023" <dsa_ta@csie.ntu.edu.tw >',
    to: email,
    subject: '[DSA2023]Your DSA Judge Account',
    text
  };
  console.log(user);
  await user.save();
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
  console.log(`User ${email} ${randPass} successfully added`);
};

if (require.main === module) {
  main();
}
//# sourceMappingURL=addUsersByXlsx.js.map
