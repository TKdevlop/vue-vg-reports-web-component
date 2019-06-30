<template>
  <div id="reports">
    <div style="padding:0px 50px">
      <div class="row">
        <div class="col s3">
          <label>SELECT YEAR</label>
          <select
            class="browser-default"
            name="selectedYear"
            v-bind:value="selectedYear"
            v-on:change="handleSelect"
          >
            <option value disabled selected>SELECT YEAR</option>
            <option v-for="year in years" v-bind:key="year" :value="year">{{year}}</option>
          </select>
        </div>
        <div class="col s3">
          <label>SELECT MONTH</label>
          <select
            class="browser-default"
            name="selectedMonth"
            v-bind:value="selectedMonth"
            v-on:change="handleSelect"
          >
            <option value disabled selected>SELECT MONTH</option>
            <option
              v-for="month in months"
              v-bind:key="month.monthNumber"
              :value="month.monthNumber"
            >{{month.monthName}}</option>
          </select>
        </div>
        <div class="col s3">
          <label>SELECT TYPE</label>
          <select
            class="browser-default"
            name="selectedType"
            v-bind:value="selectedType"
            v-on:change="handleSelect"
          >
            <option value disabled selected>SELECT TYPE</option>
            <option v-for="type in types" v-bind:key="type" :value="type">{{type}}</option>
          </select>
        </div>

        <div class="col s2" style="margin-top:25px;text-align:center">
          <button
            v-on:click="getReports"
            :disabled="loading"
            style="background:#9C27B0 !important"
            class="waves-effect waves-light btn"
          >Retrieve</button>
        </div>
        <div class="col s1" style="margin-top:25px">
          <button
            v-on:click="printReports"
            style="background:#9C27B0 !important"
            class="waves-effect waves-light btn"
          >Print</button>
        </div>
      </div>
    </div>

    <div ref="reportsTable" class="row" id="tables">
      <div class="col s6">
        <h5 class="payroll-heading">Payroll {{selectedType}} {{selectedMonth}}/2019</h5>
        <table class="striped">
          <thead>
            <tr>
              <th>TYPE</th>
              <th>AMOUNT</th>
              <th class="right">TOTAL AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(salary,i) in formatedData.totalSalaries" :key="i">
              <td>{{ salary.name }}</td>
              <td>{{ stringWithComma(salary.amt) }}</td>
              <td class="right">{{ stringWithComma(salary.totalAmt) }}</td>
            </tr>
          </tbody>
        </table>
        <h6 class="payroll-sub-heading">MONTHLY (COMMISSION)</h6>
        <table class="striped">
          <thead>
            <tr>
              <th>NAME</th>
              <th>QTY</th>
              <th>PER PIECE</th>
              <th class="right">TOTAL AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(commission,i) in formatedData.commissions" :key="i">
              <th>{{commission.name}}</th>
              <th>{{ commission.qty }}</th>
              <th>{{ commission.perPiece }}</th>
              <td class="right">{{ stringWithComma(commission.amt) }}</td>
            </tr>
          </tbody>
        </table>
        <h6 class="payroll-sub-heading">PER PIECE (Body, Neck, Sleeves)</h6>
        <table class="striped">
          <thead>
            <tr>
              <th>NAME</th>
              <th>QTY</th>

              <th class="right">TOTAL AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(nonCutters,i) in formatedData.NonCutterStatement" :key="i">
              <th>{{nonCutters.name}}</th>
              <th>{{ nonCutters.qty }}</th>
              <td class="right">{{ stringWithComma(nonCutters.amt) }}</td>
            </tr>
          </tbody>
        </table>
        <h6 class="payroll-sub-heading">PER PIECE (Cutting)</h6>
        <table class="striped">
          <thead>
            <tr>
              <th>NAME</th>
              <th>QTY</th>

              <th class="right">TOTAL AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(cutters,i) in formatedData.cutterStatement" :key="i">
              <th>{{cutters.name}}</th>
              <th>{{ cutters.qty }}</th>
              <td class="right">{{ stringWithComma(cutters.amt) }}</td>
            </tr>
          </tbody>
        </table>
        <!-- //dynamic NON CUTTING USERS -->
        <div v-for="(user,i) in formatedData.nonCuttingUsers" :key="i">
          <hr>

          <strong style="font-weight:bolder">{{user.fullname}} ({{user.userrole}})</strong>

          <hr>
          <table class="striped">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>QTY</th>

                <th>PER PIECE (AVG)</th>
                <th class="right">TOTAL AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item,i) in user.iteminfo" :key="i">
                <td>{{ productFullName(item.productshortname) }}</td>
                <td>{{ item.qty }}</td>
                <td>{{ stringWithComma(item.config_amount) }}</td>
                <td class="right">{{ stringWithComma((item.qty * item.config_amount).toFixed(2))}}</td>
              </tr>
              <tr>
                <td>TOTAL</td>
                <td>{{user.perpiecepay_itemcount}}</td>
                <td></td>
                <td class="right">{{ stringWithComma(user.perpiecepay_calc)}}.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- //dynamic -->
        <!-- //dynamic CUTTING USERS JUST NEED ARR CHANGE FOR NOW -->
        <div v-for="(user) in formatedData.cuttingUsers" :key="user.fullname">
          <hr>

          <strong style="font-weight:bolder">{{user.fullname}} ({{user.userrole}})</strong>

          <hr>
          <table class="striped">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>QTY</th>

                <th>PER PIECE (AVG)</th>
                <th class="right">TOTAL AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item,i) in user.iteminfo" :key="i">
                <td>{{ productFullName(item.productshortname) }}</td>
                <td>{{ item.qty }}</td>
                <td>{{ stringWithComma(item.config_amount) }}</td>
                <td class="right">{{ stringWithComma((item.qty * item.config_amount).toFixed(2))}}</td>
              </tr>
              <tr>
                <td>TOTAL</td>
                <td>{{user.perpiecepay_itemcount}}</td>
                <td></td>
                <td class="right">{{ stringWithComma(user.perpiecepay_calc)}}.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- //dynamic -->
      </div>
      <div class="col s6">
        <h5 class="payroll-heading" style="margin-bottom:30px">Out Side Tailors</h5>

        <!-- //dynamic OUTSIDE TAILOR USERS NEED SOME PER PIECE CHANGES-->
        <div v-for="user in formatedData.outSideUsers" :key="user.fullname">
          <hr>

          <strong style="font-weight:bolder">   {{user.fullname}} ({{user.userrole}})</strong>

          <hr>
          <table class="striped">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>QTY</th>

                <th>PER PIECE (AVG)</th>
                <th class="right">TOTAL AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item,i) in user.iteminfo" :key="i">
                <td>  {{ productFullName(item.productshortname) }}</td>
                <td>{{ item.qty }}</td>
                <td> {{ stringWithComma(item.config_amount) }}</td>
                <td class="right">  {{ stringWithComma(item.qty * item.config_amount)}}.00</td>
              </tr>
              <tr>
                   <td> TOTAL</td>
                <td>{{user.commission_itemcount}}</td>
                <td></td>
                <td class="right"> {{ stringWithComma(user.commission_calc)}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- //dynamic -->
        <h6 class="payroll-sub-heading">DEDUCTIONS</h6>
        <table class="striped">
          <thead>
            <tr>
              <th>NAME</th>
              <th class="right">AMOUNT</th>
            </tr>
          </thead>

          <tbody id="deduction">
            <tr>
              <td>LATE:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.lateamt_calc)}}</td>
            </tr>
             <tr>
              <td>SSO:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.sso_calc)}}</td>
            </tr>
              <tr>
              <td>TAX:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.itax_calc)}}</td>
            </tr>
              <tr>
              <td>VG Room:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.room_calc)}}</td>
            </tr>
              <tr>
              <td>Loan Installment:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.loan_installment_calc)}}</td>
            </tr>
            <tr>
              <td>Buy Fabric:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.fabric_calc)}}</td>
            </tr>
            <tr>
              <td>Other Deductions:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.otherdeduction_calc)}}</td>
            </tr>
             <tr>
              <td>TOTAL DEDUCTIONS:</td>
              <td class="right">{{stringWithComma(formatedData.allDeductions.total)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  created() {
    //  const elems = document.querySelectorAll("select");
    //    //js
    //       const instances = M.FormSelect.init(elems);
  },
  data() {
    return {
      selectedYear: new Date().getFullYear().toString(),
      selectedMonth: "0" + (new Date().getMonth() + 1).toString(),
      loading: false,
      formatedData: {
        totalSalaries: [],
        commissions: [],
        NonCutterStatement: [],
        cutterStatement: [],
        nonCuttingUsers: [],
        cuttingUsers: [],
        outSideUsers: [],
        allDeductions: {}
      },
      selectedType: "Advance (1-15)",
      years: ["2019", "2018", "2017"],
      months: [
        {
          monthName: "January",
          monthNumber: "01"
        },
        {
          monthName: "February",
          monthNumber: "02"
        },
        {
          monthName: "March",
          monthNumber: "03"
        },
        {
          monthName: "April",
          monthNumber: "04"
        },
        {
          monthName: "May",
          monthNumber: "05"
        },
        {
          monthName: "June",
          monthNumber: "06"
        },
        {
          monthName: "July",
          monthNumber: "07"
        },
        {
          monthName: "August",
          monthNumber: "08"
        },
        {
          monthName: "September",
          monthNumber: "09"
        },
        {
          monthName: "October",
          monthNumber: "10"
        },
        {
          monthName: "November",
          monthNumber: "11"
        },
        {
          monthName: "December",
          monthNumber: "12"
        }
      ],
      types: ["Advance (1-15)", "Final (16-31)"]
    };
  },
  methods: {
    async getReports() {
      this.loading = true;
      try {
        const res = await fetch("http://localhost:3006/api/v1/payroll/salary", {
          headers: {
            "content-type": "application/json",
            reqdate: this.selectedYear + this.selectedMonth,
            payroll_advance_final:
              this.selectedType === "Advance (1-15)"
                ? "ADVANCE_PROCESSING"
                : this.selectedType
          }
        });
        const data = await res.json();
        //TOTAL SALARIES
        this.loading = false;
        const totalSalaries = [
          {
            name: "MONTHLY(Salary)",
            amt: data.salarynetpayable_monthlyusers,
            totalAmt: data.salarynetpayable_monthlyusers
          },
          {
            name: "Monthly (Per Piece)",

            amt: data.salarynetpayable_perpieceusers,
            totalAmt: data.salarynetpayable_perpieceusers
          }
        ];
        //COMMISSIONS TOTAL
        const commissionsTotal = {
          qty: 0,
          amt: 0
        };
        //MONTHLY COMMISSIONS
        const commissions = data.commissions_monthlyusers.map(el => {
          commissionsTotal.qty += parseInt(el.perpiececomm_amt);
          commissionsTotal.amt += parseInt(el.commission_calc);
          return {
            name: el.shortname,
            qty: parseInt(el.perpiececomm_amt),
            perPiece: el.commission_itemcount + ".00",
            amt: el.commission_calc
          };
        });
        commissions.push({
          name: "TOTAL",
          qty: commissionsTotal.qty,
          amt: commissionsTotal.amt + ".00",
          perPiece: ""
        });

        //NON-CUTTING PER PIECE (Body, Neck, Sleeves) TOTAL
        const nonCutterStatementTotal = {
          qty: 0,
          amt: 0
        };
        //NON-CUTTING PER PIECE (Body, Neck, Sleeves) LIST
        const NonCutterStatement = data.rolewise_perpieceusers_noncutters.map(
          el => {
            nonCutterStatementTotal.qty += parseInt(el.perpiecepay_itemcount);
            nonCutterStatementTotal.amt += parseInt(el.perpiecepay_calc);
            return {
              name: el.userrole,
              qty: el.perpiecepay_itemcount,
              amt: el.perpiecepay_calc
            };
          }
        );
        NonCutterStatement.push({
          name: "TOTAL",
          ...nonCutterStatementTotal,
          amt: nonCutterStatementTotal.amt + ".00"
        });
        //NON-CUTTING USERS

        const nonCuttingUsers = [];
        data.namewise_perpieceusers_noncutters.forEach(el => {
          const empCodes = nonCuttingUsers.map(emp => emp.empcode);
          if (empCodes.includes(el.empcode)) {
            nonCuttingUsers.forEach(user => {
              if (user.empcode === el.empcode) {
                user.perpiecepay_itemcount += parseInt(
                  el.perpiecepay_itemcount
                );
                user.perpiecepay_calc += parseFloat(el.perpiecepay_calc);
                user.userrole += `, ${el.userrole}`;
              }
            });
          } else {
            nonCuttingUsers.push({
              empcode: el.empcode,
              fullname: el.fullname,
              perpiecepay_itemcount: parseInt(el.perpiecepay_itemcount),
              perpiecepay_calc: parseFloat(el.perpiecepay_calc),
              userrole: el.userrole,
              perpiecepay_iteminfo: el.perpiecepay_iteminfo
            });
          }
        });
        nonCuttingUsers.forEach(user => {
          let miniArr = [
            { productshortname: "J", qty: 0, totalAmt: 0 },
            { productshortname: "V", qty: 0, totalAmt: 0 },
            { productshortname: "C", qty: 0, totalAmt: 0 },
            { productshortname: "SH", qty: 0, totalAmt: 0 },
            { productshortname: "BL", qty: 0, totalAmt: 0 },
            { productshortname: "P", qty: 0, totalAmt: 0 }
          ];

          user.perpiecepay_iteminfo.forEach(item => {
            miniArr.forEach(localItem => {
              if (localItem.productshortname === item.productshortname) {
                localItem.qty += 1;
                localItem.totalAmt += parseFloat(item.config_amount);
              }
            });
          });
          user.perpiecepay_iteminfo.forEach(item => {
            miniArr.forEach(localItem => {
              if (localItem.productshortname === item.productshortname) {
                localItem.config_amount = (
                  localItem.totalAmt / parseFloat(localItem.qty)
                ).toFixed(2);
              }
            });
          });

          miniArr = miniArr.filter(el => el.qty !== 0);
          user.iteminfo = miniArr;
        });
        //CUTTING PER PIECE (CUTTING) TOTAL
        const cutterStatementTotal = {
          qty: 0,
          amt: 0
        };
        //CUTTING PER PIECE (CUTTING) LIST
        const cutterStatement = data.rolewise_perpieceusers_cutters.map(el => {
          cutterStatementTotal.qty += parseInt(el.perpiecepay_itemcount);
          cutterStatementTotal.amt += parseInt(el.perpiecepay_calc);
          return {
            name: el.userrole,
            qty: el.perpiecepay_itemcount,
            amt: el.perpiecepay_calc
          };
        });
        cutterStatement.push({
          name: "TOTAL",
          ...cutterStatementTotal,
          amt: cutterStatementTotal.amt + ".00"
        });
        // CUTTING USERS

        const cuttingUsers = [];
        data.namewise_perpieceusers_cutters.forEach(el => {
          const empCodes = cuttingUsers.map(emp => emp.empcode);
          if (empCodes.includes(el.empcode)) {
            cuttingUsers.forEach(user => {
              if (user.empcode === el.empcode) {
                user.perpiecepay_itemcount += parseInt(
                  el.perpiecepay_itemcount
                );
                user.perpiecepay_calc += parseFloat(el.perpiecepay_calc);
                user.userrole += `, ${el.userrole}`;
              }
            });
          } else {
            cuttingUsers.push({
              empcode: el.empcode,
              fullname: el.fullname,
              perpiecepay_itemcount: parseInt(el.perpiecepay_itemcount),
              perpiecepay_calc: parseFloat(el.perpiecepay_calc),
              userrole: el.userrole,
              perpiecepay_iteminfo: el.perpiecepay_iteminfo
            });
          }
        });
        cuttingUsers.forEach(user => {
          let miniArr = [
            { productshortname: "J", qty: 0, totalAmt: 0 },
            { productshortname: "V", qty: 0, totalAmt: 0 },
            { productshortname: "C", qty: 0, totalAmt: 0 },
            { productshortname: "SH", qty: 0, totalAmt: 0 },
            { productshortname: "BL", qty: 0, totalAmt: 0 },
            { productshortname: "P", qty: 0, totalAmt: 0 }
          ];

          user.perpiecepay_iteminfo.forEach(item => {
            miniArr.forEach(localItem => {
              if (localItem.productshortname === item.productshortname) {
                localItem.qty += 1;

                localItem.totalAmt += parseFloat(item.config_amount);
              }
            });
          });
          user.perpiecepay_iteminfo.forEach(item => {
            miniArr.forEach(localItem => {
              if (localItem.productshortname === item.productshortname) {
                localItem.config_amount = +(
                  localItem.totalAmt / parseFloat(localItem.qty)
                ).toFixed(2);
              }
            });
          });

          miniArr = miniArr.filter(el => el.qty !== 0);
          user.iteminfo = miniArr;
        });
        //OUTSIDE TOTAL
        let outsideTotal = 0;
        //OUTSIDE CHANGES
        data.netpayable_outsourced_userwise.forEach(el => {
          let miniArr = [
            { productshortname: "J", qty: 0 },
            { productshortname: "V", qty: 0 },
            { productshortname: "C", qty: 0 },
            { productshortname: "SH", qty: 0 },
            { productshortname: "BL", qty: 0 },
            { productshortname: "P", qty: 0 }
          ];
          if (el.commission_iteminfo) {
            el.commission_iteminfo.forEach(item => {
              miniArr.forEach(localItem => {
                if (localItem.productshortname === item.productshortname) {
                  localItem.qty += 1;
                  localItem.config_amount = parseInt(el.perpiececomm_amt);
                  outsideTotal += parseFloat(el.perpiececomm_amt);
                }
              });
            });
          }

          miniArr = miniArr.filter(el => el.qty !== 0);
          el.iteminfo = miniArr;
        });
        //OUTSIDE STATEMENT
        const outSideUsers = [...data.netpayable_outsourced_userwise];
        //FINAL TOTAL SALARIES CALCULATIONS
        totalSalaries.push({
          name: "Monthly (Outside Tailors)",

          amt: outsideTotal + ".00",
          totalAmt: outsideTotal + ".00"
        });
        const allTotalSalariesAmount = totalSalaries.reduce((prev, next) => {
          if (typeof prev === "number") {
            return prev + parseInt(next.totalAmt);
          }
          return parseInt(prev.totalAmt) + parseInt(next.totalAmt);
        });
        totalSalaries.push({
          name: "TOTAL",
          amt: "",
          totalAmt: allTotalSalariesAmount + ".00"
        });
        //DEDUCTIONS
        const { salaryadv_total, ...allDeductions } = data.deductions;

        let deTotal = 0;

        for (let deduction in allDeductions) {
          deTotal += parseFloat(allDeductions[deduction]);
        }
        allDeductions.total = deTotal;

        //SETTING UP DATA OBJECT
        this.formatedData = {
          totalSalaries, //correct
          commissions, //correct
          NonCutterStatement, // correct
          //  nonCutterStatementTotal, //correct
          cutterStatement, //correct
          //  cutterStatementTotal, //correct
          nonCuttingUsers, //correct
          cuttingUsers,
          outSideUsers,
          allDeductions
        };
        console.log(this.formatedData);
      } catch (e) {
        this.loading = false;
      }
    },
    handleSelect(e) {
      console.log(e.target.name);
      this[e.target.name] = e.target.value;
    },
    stringWithComma(num) {
      if (num===undefined || num===null) return;
      return num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    },
    productFullName(name) {
      switch (name) {
        case "J":
          return "JACKET";
        case "V":
          return "VEST";
        case "C":
          return "COLLAR";
        case "SH":
          return "SHIRT";
        case "BL":
          return "SLEEVE";
        case "P":
          return "PANTS";
      }
    },
    printReports() {
      const tables = this.$refs.reportsTable;
      const date = new Date();
      const WinPrint = window.open("", "", "");
        WinPrint.document.write(`<title>${this.selectedType} ${this.selectedMonth}/${this.selectedYear}</title>`)
          WinPrint.document.write(`<div style="position:absolute; top:0;right:0;">Print Date: ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}</div>`)
      WinPrint.document.write(
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">'
      );
      WinPrint.document.write(`
    <style>
     .payroll-heading {
      margin-bottom:18px;
      font-weight:bolder;
      text-align:center
  }
  .payroll-sub-heading {
     margin:16px 0px;
      font-weight:bolder;
      text-align:center
  }
  #deduction > tr > :last-child{
       color:red;
  }
  .right{
      text-align: right;
  }
  tbody :last-child > * {
    font-weight: bolder;
}
tbody :not(:last-child) > * {
  font-weight: normal;
}
    </style>
    `);
      WinPrint.document.write(tables.innerHTML);

      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();
    }
  }
};
</script>
<style scoped lang="scss">
@import "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css";
.payroll-heading {
  margin-bottom: 18px;
  font-weight: bolder;
  text-align: center;
}
.payroll-sub-heading {
  margin: 16px 0px;
  font-weight: bolder;
  text-align: center;
}
#deduction > tr > :last-child {
  color: red;
}
.right {
  text-align: right;
}
tbody :last-child > * {
  font-weight: bolder !important;
}
tbody :not(:last-child) > * {
  font-weight: normal !important;
}
</style>